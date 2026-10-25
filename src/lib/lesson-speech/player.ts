import { claimLessonMedia } from '$lib/lesson-media';
import type { Synthesize, SynthesizedSpeech, WordBoundary } from './azure';
import type { SpeechChunk } from './text';

export class SpeechCache {
	private entries = new Map<string, SynthesizedSpeech>();
	private bytes = 0;
	constructor(private readonly limit = 20 * 1024 * 1024) {}
	get(key: string): SynthesizedSpeech | undefined {
		const value = this.entries.get(key);
		if (value) {
			this.entries.delete(key);
			this.entries.set(key, value);
		}
		return value;
	}
	set(key: string, value: SynthesizedSpeech) {
		const previous = this.entries.get(key);
		if (previous) this.bytes -= previous.audio.byteLength;
		this.entries.delete(key);
		if (value.audio.byteLength > this.limit) return;
		this.entries.set(key, value);
		this.bytes += value.audio.byteLength;
		while (this.bytes > this.limit) {
			const oldest = this.entries.keys().next().value!;
			this.bytes -= this.entries.get(oldest)!.audio.byteLength;
			this.entries.delete(oldest);
		}
	}
	clear() {
		this.entries.clear();
		this.bytes = 0;
	}
}

export interface PlayerEvents {
	state: (state: 'idle' | 'loading' | 'playing') => void;
	word: (chunk: SpeechChunk | null, word?: WordBoundary) => void;
	error: (message: string) => void;
}

export class LessonSpeechPlayer {
	private context?: AudioContext;
	private abort?: AbortController;
	private source?: AudioBufferSourceNode;
	private frame = 0;
	private generation = 0;
	private release?: () => void;
	private cache = new SpeechCache();

	constructor(
		private readonly synthesize: Synthesize,
		private readonly events: PlayerEvents,
		private readonly createContext = () => new AudioContext()
	) {}

	stop = () => {
		this.generation++;
		this.abort?.abort();
		this.abort = undefined;
		this.source?.stop();
		this.source?.disconnect();
		this.source = undefined;
		cancelAnimationFrame(this.frame);
		this.events.word(null);
		this.events.state('idle');
		this.release?.();
		this.release = undefined;
	};

	async play(chunks: SpeechChunk[]) {
		this.stop();
		const generation = this.generation;
		const abort = new AbortController();
		this.abort = abort;
		const { signal } = abort;
		this.release = claimLessonMedia(this.stop);
		this.events.state('loading');
		try {
			// Resume on the original click stack, before waiting for SDK/network requests (iOS).
			this.context ??= this.createContext();
			const resumed = this.context.resume();
			const load = async (chunk: SpeechChunk) => {
				const key = `${chunk.voice}\0${chunk.text}`;
				const cached = this.cache.get(key);
				if (cached) return cached;
				const speech = await this.synthesize(chunk.text, chunk.voice, signal);
				signal.throwIfAborted();
				this.cache.set(key, speech);
				return speech;
			};
			await resumed;
			let next: Promise<SynthesizedSpeech> | undefined;
			for (let i = 0; i < chunks.length; i++) {
				signal.throwIfAborted();
				const speech = await (next ?? load(chunks[i]));
				signal.throwIfAborted();
				next = chunks[i + 1] ? load(chunks[i + 1]) : undefined;
				// Keep a failed prefetch until its turn, without an unhandled rejection or silent retry.
				void next?.catch(() => {});
				const buffer = await this.context.decodeAudioData(speech.audio.slice(0));
				signal.throwIfAborted();
				await this.playBuffer(buffer, chunks[i], speech.words, signal);
				this.events.word(null);
				this.events.state('loading');
			}
			if (generation === this.generation) this.stop();
		} catch (error) {
			if (generation !== this.generation || signal.aborted) return;
			this.stop();
			this.events.error(
				error instanceof Error ? error.message : 'Pembacaan gagal. Silakan coba lagi.'
			);
		}
	}

	private playBuffer(
		buffer: AudioBuffer,
		chunk: SpeechChunk,
		words: WordBoundary[],
		signal: AbortSignal
	) {
		const context = this.context!;
		const source = context.createBufferSource();
		this.source = source;
		source.buffer = buffer;
		source.connect(context.destination);
		return new Promise<void>((resolve, reject) => {
			const abort = () => {
				source.onended = null;
				reject(new DOMException('Pembacaan dibatalkan.', 'AbortError'));
			};
			signal.addEventListener('abort', abort, { once: true });
			source.onended = () => {
				signal.removeEventListener('abort', abort);
				cancelAnimationFrame(this.frame);
				source.disconnect();
				if (this.source === source) this.source = undefined;
				resolve();
			};
			const start = context.currentTime;
			let index = -1;
			let active = -2;
			const update = () => {
				if (signal.aborted) return;
				const elapsed = context.currentTime - start;
				while (words[index + 1] && words[index + 1].start <= elapsed) index++;
				const word = words[index];
				const end = word ? word.start + word.duration : 0;
				const visible =
					word && elapsed < (word.duration > 0 ? end : (words[index + 1]?.start ?? buffer.duration))
						? index
						: -1;
				if (visible !== active) {
					active = visible;
					this.events.word(visible < 0 ? null : chunk, visible < 0 ? undefined : word);
				}
				this.frame = requestAnimationFrame(update);
			};
			source.start();
			this.events.state('playing');
			update();
		});
	}

	destroy() {
		this.stop();
		this.cache.clear();
		void this.context?.close().catch(() => {});
	}
}
