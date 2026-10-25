export interface TextPoint {
	node: Text;
	start: number;
	end: number;
}

export interface ReadableBlock {
	element: HTMLElement;
	text: string;
	points: TextPoint[];
}

export interface SpeechChunk {
	text: string;
	voice: string;
	offset: number;
	block: ReadableBlock;
}

const readableElements = 'p,h1,h2,h3,h4,h5,h6';
const excluded =
	'button,input,textarea,select,option,script,style,noscript,svg,rt,rp,[hidden],[aria-hidden="true"]';

/** Visible paragraphs and headings are readable; inline markup keeps its original DOM offsets. */
export function collectReadableBlocks(root: HTMLElement): ReadableBlock[] {
	const blocks: ReadableBlock[] = [];
	const visibility = new WeakMap<Element, boolean>();
	let current: ReadableBlock | undefined;
	function visible(element: Element): boolean {
		if (visibility.has(element)) return visibility.get(element)!;
		const style = getComputedStyle(element);
		const result =
			!element.matches(excluded) &&
			style.display !== 'none' &&
			style.visibility !== 'hidden' &&
			style.visibility !== 'collapse' &&
			(element === root || !element.parentElement || visible(element.parentElement));
		visibility.set(element, result);
		return result;
	}
	function finish() {
		if (current?.text.endsWith(' ')) {
			current.text = current.text.slice(0, -1);
			current.points.pop();
		}
		if (current?.text) blocks.push(current);
		current = undefined;
	}
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
	while (walker.nextNode()) {
		const item = walker.currentNode;
		if (
			item instanceof HTMLBRElement &&
			current &&
			item.closest(readableElements) === current.element &&
			visible(item)
		) {
			const last = current.points.at(-1);
			if (last && !current.text.endsWith(' ')) {
				current.text += ' ';
				current.points.push({ node: last.node, start: last.end, end: last.end });
			}
			continue;
		}
		if (!(item instanceof Text) || !item.parentElement || !visible(item.parentElement)) continue;
		const element = item.parentElement.closest<HTMLElement>(readableElements);
		if (!element || !root.contains(element)) continue;
		if (current?.element !== element) {
			finish();
			current = { element, text: '', points: [] };
		}
		for (let i = 0; i < item.data.length; i++) {
			const char = item.data[i];
			if (/\s/u.test(char)) {
				if (!current!.text || current!.text.endsWith(' ')) continue;
				current!.text += ' ';
			} else current!.text += char;
			current!.points.push({ node: item, start: i, end: i + 1 });
		}
	}
	finish();
	return blocks;
}

export function blockRange(
	block: ReadableBlock,
	start = 0,
	length = block.text.length
): Range | null {
	if (start < 0 || length <= 0) return null;
	const first = block.points[start];
	const last = block.points[Math.min(start + length, block.points.length) - 1];
	if (!first || !last) return null;
	const range = document.createRange();
	range.setStart(first.node, first.start);
	range.setEnd(last.node, last.end);
	return range;
}

export const voices = { id: 'id-ID-GadisNeural', ja: 'ja-JP-NanamiNeural' } as const;

/** Offsets are UTF-16 positions into the normalized block, just like JS SDK text offsets. */
export function speechChunks(block: ReadableBlock): SpeechChunk[] {
	const runs: { start: number; end: number; language: keyof typeof voices }[] = [];
	let language: keyof typeof voices | undefined;
	let start = 0;
	let index = 0;
	for (const char of block.text) {
		const next = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(char)
			? 'ja'
			: /\p{L}/u.test(char)
				? 'id'
				: undefined;
		if (next && language && next !== language) {
			runs.push({ start, end: index, language });
			start = index;
		}
		if (next) language = next;
		index += char.length;
	}
	runs.push({ start, end: block.text.length, language: language ?? 'id' });
	const chunks: SpeechChunk[] = [];
	for (const run of runs) {
		let cursor = run.start;
		while (cursor < run.end) {
			let end = Math.min(cursor + 1000, run.end);
			if (end < run.end) {
				const slice = block.text.slice(cursor, end);
				const sentences = [...slice.matchAll(/[.!?。！？](?:\s|$)/gu)];
				const boundary = sentences.at(-1) ?? [...slice.matchAll(/\s/gu)].at(-1);
				if (boundary && boundary.index > 0) end = cursor + boundary.index + boundary[0].length;
				// Do not split a surrogate pair at the hard limit.
				if (/[\uD800-\uDBFF]/u.test(block.text[end - 1])) end--;
			}
			const raw = block.text.slice(cursor, end);
			const text = raw.trim();
			if (text)
				chunks.push({
					block,
					text,
					voice: voices[run.language],
					offset: cursor + raw.indexOf(text)
				});
			cursor = end;
		}
	}
	return chunks;
}
