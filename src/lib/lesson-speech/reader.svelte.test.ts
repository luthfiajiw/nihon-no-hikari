import { afterEach, describe, expect, it, vi } from 'vitest';
import hiragana from '../../../tests/fixtures/lesson-hiragana.html?raw';
import { claimLessonMedia } from '$lib/lesson-media';
import { createLessonReader } from './reader';
import { LessonSpeechPlayer } from './player';
import { blockRange, collectReadableBlocks, speechChunks } from './text';
import type { Synthesize, SynthesizedSpeech } from './azure';
import './reader.css';

class FakeSource {
	onended: (() => void) | null = null;
	buffer: AudioBuffer | null = null;
	connect = vi.fn();
	disconnect = vi.fn();
	start = vi.fn();
	stop = vi.fn();
	finish() {
		this.onended?.();
	}
}
class AudioClock {
	currentTime = 0;
	destination = {};
	sources: FakeSource[] = [];
	resume = vi.fn(async () => {});
	close = vi.fn(async () => {});
	decodeAudioData = vi.fn(async () => ({ duration: 1 }) as AudioBuffer);
	createBufferSource() {
		const source = new FakeSource();
		this.sources.push(source);
		return source;
	}
	context = () => this as unknown as AudioContext;
}
const disposals: (() => void)[] = [];
afterEach(() => {
	for (const dispose of disposals.splice(0)) dispose();
	document.body.replaceChildren();
	vi.restoreAllMocks();
});

function setup(html: string) {
	const wrapper = document.createElement('div');
	wrapper.className = 'lesson-reader';
	wrapper.style.cssText = 'width:600px;margin:40px;';
	const root = document.createElement('div');
	root.innerHTML = html;
	const overlay = document.createElement('div');
	overlay.className = 'lesson-reader-overlay';
	wrapper.append(root, overlay);
	document.body.append(wrapper);
	return { wrapper, root, overlay };
}
const speech = (): SynthesizedSpeech => ({
	audio: new ArrayBuffer(8),
	words: [{ start: 0.3, duration: 0.4, offset: 0, length: 4 }]
});

describe('lesson speech reader', () => {
	it('floats each paragraph/heading control left of its text without covering vocabulary audio at desktop and mobile widths', async () => {
		const { root, overlay, wrapper } = setup(hiragana);
		wrapper.style.fontFamily = 'Arial, sans-serif';
		const controller = createLessonReader(root, overlay, {
			synthesize: async () => speech(),
			error: vi.fn(),
			createContext: new AudioClock().context
		});
		disposals.push(() => controller.destroy());
		const assertNoOverlap = () => {
			const paragraphs = collectReadableBlocks(root);
			const buttons = [...overlay.querySelectorAll('button')];
			expect(buttons).toHaveLength(paragraphs.length);
			for (const [index, button] of buttons.entries()) {
				const rect = button.getBoundingClientRect();
				const textRect = blockRange(paragraphs[index])!.getBoundingClientRect();
				expect(rect.right).toBeLessThanOrEqual(textRect.left - 7.5);
				expect(rect.left).toBeGreaterThanOrEqual(wrapper.getBoundingClientRect().left);
				for (const audio of root.querySelectorAll('[data-play-audio]')) {
					const other = audio.getBoundingClientRect();
					expect(
						rect.right <= other.left ||
							rect.left >= other.right ||
							rect.bottom <= other.top ||
							rect.top >= other.bottom
					).toBe(true);
				}
			}
		};
		assertNoOverlap();
		wrapper.style.width = '350px';
		window.dispatchEvent(new Event('resize'));
		await new Promise(requestAnimationFrame);
		assertNoOverlap();
	});

	it.each(['p', 'h4'])(
		'highlights the exact native DOM range inside %s markup and clears it when stopped',
		async (tag) => {
			const { root, overlay } = setup(`<${tag}>Halo <strong>dunia</strong></${tag}>`);
			const clock = new AudioClock();
			const controller = createLessonReader(root, overlay, {
				synthesize: async () => ({
					audio: new ArrayBuffer(8),
					words: [{ start: 0.3, duration: 0.4, offset: 5, length: 5 }]
				}),
				error: vi.fn(),
				createContext: clock.context
			});
			disposals.push(() => controller.destroy());
			const key = overlay.querySelector('style')!.textContent!.match(/lesson-speech-word-\d+/)![0];
			const button = overlay.querySelector<HTMLButtonElement>('[data-scope="block"]')!;
			expect(button.getAttribute('aria-label')).toBe(
				`Baca ${tag === 'p' ? 'paragraf' : 'judul'}: Halo dunia`
			);
			button.click();
			await vi.waitFor(() => expect(clock.sources).toHaveLength(1));
			clock.currentTime = 0.4;
			await vi.waitFor(() => expect(CSS.highlights.has(key)).toBe(true));
			expect([...CSS.highlights.get(key)!][0].toString()).toBe('dunia');
			button.click();
			expect(CSS.highlights.has(key)).toBe(false);
			expect(clock.sources[0].stop).toHaveBeenCalledOnce();
		}
	);
	it('creates paragraph and heading controls, reads only the clicked block, and preserves inline markup', async () => {
		const { root, overlay, wrapper } = setup(
			'<section><h2>Judul</h2><div>Catatan biasa</div><p>Halo <strong>dunia</strong></p><section><p>あい</p></section></section>'
		);
		const before = root.innerHTML;
		const clock = new AudioClock();
		const synthesize = vi
			.fn<Synthesize>()
			.mockResolvedValue({ audio: new ArrayBuffer(8), words: [] });
		const controller = createLessonReader(root, overlay, {
			synthesize,
			error: vi.fn(),
			createContext: clock.context
		});
		disposals.push(() => controller.destroy());
		expect(overlay.querySelectorAll('[data-scope="section"]')).toHaveLength(0);
		expect(overlay.querySelectorAll('[data-scope="block"]')).toHaveLength(3);
		const [headingButton, button] = [
			...overlay.querySelectorAll<HTMLButtonElement>('[data-scope="block"]')
		];
		button.click();
		await vi.waitFor(() => expect(clock.sources).toHaveLength(1));
		clock.sources[0].finish();
		await vi.waitFor(() => expect(button.getAttribute('aria-pressed')).toBe('false'));
		expect(synthesize.mock.calls.map(([text]) => text)).toEqual(['Halo dunia']);
		expect(root.innerHTML).toBe(before);
		root.querySelector('strong')!.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
		expect(overlay.querySelectorAll('.is-hovered')).toHaveLength(1);
		button.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
		expect(button.classList.contains('is-hovered')).toBe(true);
		root.querySelector('h2')!.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
		expect(headingButton.classList.contains('is-hovered')).toBe(true);
		expect(overlay.querySelectorAll('.is-hovered')).toHaveLength(1);
		root.querySelector('div')!.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
		expect(overlay.querySelectorAll('.is-hovered')).toHaveLength(0);
		wrapper.dispatchEvent(new PointerEvent('pointerleave'));
		expect(overlay.querySelectorAll('.is-hovered')).toHaveLength(0);
		button.focus();
		expect(document.activeElement).toBe(button);
	});

	it('creates no fallback control for content without readable paragraphs or headings', () => {
		const { root, overlay } = setup(
			'Teks langsung <section><h2 hidden>Judul</h2><h6> </h6><div>Catatan</div><ul><li>Daftar</li></ul><p hidden>Rahasia</p><p> </p></section>'
		);
		const synthesize = vi.fn<Synthesize>();
		const controller = createLessonReader(root, overlay, { synthesize, error: vi.fn() });
		disposals.push(() => controller.destroy());
		expect(overlay.querySelectorAll('button')).toHaveLength(0);
		expect(synthesize).not.toHaveBeenCalled();
	});

	it('highlights the spoken word with rectangle fallback and updates it on resize/scroll', async () => {
		vi.spyOn(CSS, 'highlights', 'get').mockReturnValue(
			undefined as unknown as typeof CSS.highlights
		);
		const { root, overlay } = setup('<p>Halo <strong>dunia</strong></p>');
		const clock = new AudioClock();
		const controller = createLessonReader(root, overlay, {
			synthesize: async () => speech(),
			error: vi.fn(),
			createContext: clock.context
		});
		disposals.push(() => controller.destroy());
		overlay.querySelector<HTMLButtonElement>('[data-scope="block"]')!.click();
		await vi.waitFor(() => expect(clock.sources).toHaveLength(1));
		expect(overlay.querySelectorAll('.lesson-speech-word-rect')).toHaveLength(0);
		clock.currentTime = 0.4;
		await vi.waitFor(() =>
			expect(overlay.querySelectorAll('.lesson-speech-word-rect')).toHaveLength(1)
		);
		const oldLeft = overlay.querySelector<HTMLElement>('.lesson-speech-word-rect')!.style.left;
		root.style.paddingLeft = '80px';
		window.dispatchEvent(new Event('resize'));
		window.dispatchEvent(new Event('scroll'));
		await vi.waitFor(() =>
			expect(overlay.querySelector<HTMLElement>('.lesson-speech-word-rect')!.style.left).not.toBe(
				oldLeft
			)
		);
		clock.currentTime = 0.8;
		await vi.waitFor(() =>
			expect(overlay.querySelectorAll('.lesson-speech-word-rect')).toHaveLength(0)
		);
	});

	it('reports failures and retries only the selected paragraph without creating a section control', async () => {
		const { root, overlay } = setup('<p>Halo dunia</p>');
		const error = vi.fn();
		const synthesize = vi
			.fn<Synthesize>()
			.mockRejectedValueOnce(new Error('Jaringan gagal'))
			.mockResolvedValue(speech());
		const clock = new AudioClock();
		const controller = createLessonReader(root, overlay, {
			synthesize,
			error,
			createContext: clock.context
		});
		disposals.push(() => controller.destroy());
		expect(overlay.querySelectorAll('[data-scope="section"]')).toHaveLength(0);
		overlay.querySelector<HTMLButtonElement>('[data-scope="block"]')!.click();
		await vi.waitFor(() => expect(error).toHaveBeenCalledWith('Jaringan gagal'));
		controller.retry();
		await vi.waitFor(() => expect(clock.sources).toHaveLength(1));
		expect(synthesize).toHaveBeenCalledTimes(2);
	});
});

describe('lesson playback lifecycle', () => {
	it('reports a failed prefetch at its turn without silently synthesizing it again', async () => {
		const { root } = setup('<p>Halo あい</p>');
		const chunks = speechChunks(collectReadableBlocks(root)[0]);
		const clock = new AudioClock();
		const synthesize = vi
			.fn<Synthesize>()
			.mockResolvedValueOnce(speech())
			.mockRejectedValueOnce(new Error('Jaringan gagal'));
		const error = vi.fn();
		const player = new LessonSpeechPlayer(
			synthesize,
			{ word: vi.fn(), state: vi.fn(), error },
			clock.context
		);
		disposals.push(() => player.destroy());
		const pending = player.play(chunks);
		await vi.waitFor(() => expect(clock.sources).toHaveLength(1));
		clock.sources[0].finish();
		await pending;
		expect(synthesize).toHaveBeenCalledTimes(2);
		expect(error).toHaveBeenCalledWith('Jaringan gagal');
	});
	it('uses playback time for word events, prefetches only the next chunk, and reuses cached paragraph audio', async () => {
		const { root } = setup('<p>Halo あい lalu</p>');
		const chunks = speechChunks(collectReadableBlocks(root)[0]);
		const clock = new AudioClock();
		const synthesize = vi.fn<Synthesize>().mockResolvedValue(speech());
		const word = vi.fn();
		const player = new LessonSpeechPlayer(
			synthesize,
			{ word, state: vi.fn(), error: vi.fn() },
			clock.context
		);
		disposals.push(() => player.destroy());
		const playing = player.play(chunks);
		await vi.waitFor(() => expect(clock.sources).toHaveLength(1));
		expect(synthesize).toHaveBeenCalledTimes(2);
		expect(word).not.toHaveBeenCalledWith(chunks[0], expect.anything());
		clock.currentTime = 0.4;
		await vi.waitFor(() => expect(word).toHaveBeenCalledWith(chunks[0], speech().words[0]));
		player.stop();
		await playing;
		const repeated = player.play([chunks[0]]);
		await vi.waitFor(() => expect(clock.sources).toHaveLength(2));
		expect(synthesize).toHaveBeenCalledTimes(2);
		player.stop();
		await repeated;
	});

	it('cancels old requests and discards late results after another audio owner or lesson takes over', async () => {
		const { root } = setup('<p>Halo dunia</p>');
		const chunks = speechChunks(collectReadableBlocks(root)[0]);
		const clock = new AudioClock();
		let resolve!: (speech: SynthesizedSpeech) => void;
		const synthesize = vi.fn<Synthesize>(
			() =>
				new Promise((done) => {
					resolve = done;
				})
		);
		const word = vi.fn();
		const previousAudio = vi.fn();
		claimLessonMedia(previousAudio);
		const player = new LessonSpeechPlayer(
			synthesize,
			{ word, state: vi.fn(), error: vi.fn() },
			clock.context
		);
		disposals.push(() => player.destroy());
		const pending = player.play(chunks);
		await vi.waitFor(() => expect(synthesize).toHaveBeenCalledOnce());
		expect(previousAudio).toHaveBeenCalledOnce();
		const release = claimLessonMedia(vi.fn());
		disposals.push(release);
		expect(synthesize.mock.calls[0][2].aborted).toBe(true);
		resolve(speech());
		await pending;
		expect(clock.sources).toHaveLength(0);
		expect(word).toHaveBeenLastCalledWith(null);
	});
});
