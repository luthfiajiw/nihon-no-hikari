import type { Synthesize } from './azure';
import { LessonSpeechPlayer } from './player';
import { blockRange, collectReadableBlocks, speechChunks, type ReadableBlock } from './text';

interface Control {
	element: HTMLElement;
	button: HTMLButtonElement;
	block: ReadableBlock;
	label: string;
}

interface ReaderOptions {
	synthesize: Synthesize;
	error: (message: string) => void;
	createContext?: () => AudioContext;
}

const speaker =
	'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>';
const square =
	'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
const loading =
	'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 12a8 8 0 1 1-8-8" stroke-linecap="round"/></svg>';
let nextHighlight = 0;

export function createLessonReader(
	root: HTMLElement,
	overlay: HTMLElement,
	options: ReaderOptions
) {
	const blocks = collectReadableBlocks(root);
	const controls: Control[] = [];
	let selected: Control | undefined;
	let state: 'idle' | 'loading' | 'playing' = 'idle';
	let highlight: Range | null = null;
	let layoutFrame = 0;
	const highlightName = `lesson-speech-word-${nextHighlight++}`;
	const supportsHighlight = typeof Highlight !== 'undefined' && !!CSS.highlights;
	const style = document.createElement('style');
	style.textContent = `::highlight(${highlightName}) { background-color: #fde047; color: #1c1917; }`;
	overlay.append(style);
	const wordLayer = document.createElement('div');
	wordLayer.className = 'lesson-speech-word-layer';
	wordLayer.setAttribute('aria-hidden', 'true');
	overlay.append(wordLayer);

	function renderHighlight() {
		wordLayer.replaceChildren();
		if (supportsHighlight) {
			CSS.highlights.delete(highlightName);
			if (highlight) CSS.highlights.set(highlightName, new Highlight(highlight));
		} else if (highlight) {
			const base = overlay.getBoundingClientRect();
			for (const rect of highlight.getClientRects()) {
				const mark = document.createElement('span');
				mark.className = 'lesson-speech-word-rect';
				Object.assign(mark.style, {
					left: `${rect.left - base.left}px`,
					top: `${rect.top - base.top}px`,
					width: `${rect.width}px`,
					height: `${rect.height}px`
				});
				wordLayer.append(mark);
			}
		}
	}

	function paint() {
		for (const control of controls) {
			const active = control === selected && state !== 'idle';
			control.button.dataset.state = active ? state : 'idle';
			control.button.setAttribute('aria-pressed', String(active));
			control.button.setAttribute('aria-busy', String(active && state === 'loading'));
			control.button.setAttribute(
				'aria-label',
				active ? `Hentikan pembacaan ${control.label}` : `Baca ${control.label}`
			);
			control.button.title = active
				? state === 'loading'
					? 'Menyiapkan suara · klik untuk berhenti'
					: 'Hentikan pembacaan'
				: `Baca ${control.label}`;
			control.button.innerHTML = active ? (state === 'loading' ? loading : square) : speaker;
		}
	}

	const player = new LessonSpeechPlayer(
		options.synthesize,
		{
			state: (value) => {
				state = value;
				paint();
			},
			word: (chunk, word) => {
				highlight =
					chunk && word ? blockRange(chunk.block, chunk.offset + word.offset, word.length) : null;
				renderHighlight();
			},
			error: options.error
		},
		options.createContext
	);

	function play(control: Control) {
		selected = control;
		options.error('');
		void player.play(speechChunks(control.block));
	}

	function addControl(block: ReadableBlock) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'lesson-speech-control';
		button.dataset.scope = 'block';
		const label = `${block.element.tagName === 'P' ? 'paragraf' : 'judul'}: ${block.text.slice(0, 70)}`;
		const control = { element: block.element, button, block, label };
		button.addEventListener('click', () => {
			if (selected === control && state !== 'idle') {
				player.stop();
				options.error('');
			} else play(control);
		});
		controls.push(control);
		overlay.append(button);
	}

	for (const block of blocks) addControl(block);
	paint();

	function layout() {
		const base = overlay.getBoundingClientRect();
		const interactive = [...root.querySelectorAll('button,a,input,select,textarea')].map(
			(element) => element.getBoundingClientRect()
		);
		const placed: { x: number; y: number }[] = [];
		const size = 24;
		const gap = 8;
		for (const control of controls) {
			const range = blockRange(control.block);
			const rect = range?.getBoundingClientRect();
			const firstLine = range?.getClientRects()[0];
			if (!rect || !rect.height || !firstLine) {
				control.button.hidden = true;
				continue;
			}
			control.button.hidden = false;
			// Float beside the left edge of the text, centered on its first line.
			const x = rect.left - base.left - size - gap;
			let y = firstLine.top - base.top + (firstLine.height - size) / 2;
			while (
				placed.some(
					(other) => Math.abs(other.x - x) < size + 2 && Math.abs(other.y - y) < size + 2
				) ||
				interactive.some(
					(other) =>
						other.width > 0 &&
						other.height > 0 &&
						x + base.left < other.right + 2 &&
						x + base.left + size > other.left - 2 &&
						y + base.top < other.bottom + 2 &&
						y + base.top + size > other.top - 2
				)
			)
				y += size + 2;
			placed.push({ x, y });
			control.button.style.left = `${x}px`;
			control.button.style.top = `${y}px`;
		}
		renderHighlight();
	}
	const scheduleLayout = () => {
		cancelAnimationFrame(layoutFrame);
		layoutFrame = requestAnimationFrame(layout);
	};
	const wrapper = root.parentElement!;
	function hover(event: PointerEvent) {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const hovered =
			controls.find((control) => control.button.contains(target)) ??
			controls.find((control) => control.element.contains(target));
		for (const control of controls)
			control.button.classList.toggle('is-hovered', control === hovered);
	}
	function leave() {
		for (const control of controls) control.button.classList.remove('is-hovered');
	}
	wrapper.addEventListener('pointermove', hover);
	wrapper.addEventListener('pointerleave', leave);
	window.addEventListener('scroll', scheduleLayout, true);
	window.addEventListener('resize', scheduleLayout);
	const observer = new ResizeObserver(scheduleLayout);
	observer.observe(root);
	layout();

	return {
		retry: () => {
			if (selected) play(selected);
		},
		destroy() {
			player.destroy();
			observer.disconnect();
			cancelAnimationFrame(layoutFrame);
			wrapper.removeEventListener('pointermove', hover);
			wrapper.removeEventListener('pointerleave', leave);
			window.removeEventListener('scroll', scheduleLayout, true);
			window.removeEventListener('resize', scheduleLayout);
			if (supportsHighlight) CSS.highlights.delete(highlightName);
			overlay.replaceChildren();
		}
	};
}
