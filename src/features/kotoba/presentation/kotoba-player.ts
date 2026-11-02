import type { KotobaVocabulary } from '../data/kotoba-topic-detail';

export type PlaybackState = {
	playingId: string | null;
	playingAll: boolean;
	message: string;
};

export type PlayResult = 'ok' | 'blocked' | 'error';
export type SequenceResult = 'completed' | 'cancelled' | 'blocked' | 'failed';

export class KotobaPlayer {
	private version = 0;
	private audio: HTMLAudioElement | null = null;
	private cancelPending: (() => void) | null = null;

	constructor(
		private readonly changed: (state: PlaybackState) => void,
		private readonly resolveWord: (id: string) => Promise<KotobaVocabulary | undefined>,
		private readonly createAudio = () => new Audio(),
		private readonly speech = () =>
			typeof window !== 'undefined' ? window.speechSynthesis : undefined
	) {}

	stop() {
		this.version++;
		this.cancelPending?.();
		this.cancelPending = null;
		if (this.audio) {
			this.audio.pause();
			this.audio.removeAttribute('src');
			this.audio.load();
			this.audio = null;
		}
		this.speech()?.cancel();
		this.changed({ playingId: null, playingAll: false, message: '' });
	}

	private recorded(url: string): Promise<PlayResult> {
		return new Promise((resolve) => {
			const audio = this.createAudio();
			this.audio = audio;
			let settled = false;

			const finish = (result: PlayResult) => {
				if (settled) return;
				settled = true;
				audio.onended = null;
				audio.onerror = null;
				audio.pause();
				audio.removeAttribute('src');
				audio.load();
				if (this.audio === audio) this.audio = null;
				this.cancelPending = null;
				resolve(result);
			};

			this.cancelPending = () => finish('error');
			audio.onended = () => finish('ok');
			audio.onerror = () => finish('error');
			audio.src = url;

			const playPromise = audio.play();
			if (playPromise && typeof playPromise.catch === 'function') {
				playPromise.catch((err: unknown) => {
					if (err instanceof Error && err.name === 'NotAllowedError') {
						finish('blocked');
					} else {
						finish('error');
					}
				});
			}
		});
	}

	private spoken(word: KotobaVocabulary): Promise<PlayResult> {
		const speech = this.speech();
		const voice = speech?.getVoices().find((item) => item.lang.startsWith('ja'));
		if (!speech || !voice || typeof SpeechSynthesisUtterance === 'undefined') {
			return Promise.resolve('error');
		}

		return new Promise((resolve) => {
			const utterance = new SpeechSynthesisUtterance(word.hiragana);
			let settled = false;

			const finish = (result: PlayResult) => {
				if (settled) return;
				settled = true;
				utterance.onend = null;
				utterance.onerror = null;
				this.cancelPending = null;
				resolve(result);
			};

			this.cancelPending = () => finish('error');
			utterance.lang = 'ja-JP';
			utterance.voice = voice;
			utterance.rate = 0.8;
			utterance.onend = () => finish('ok');
			utterance.onerror = (event) => {
				if (event.error === 'not-allowed') {
					finish('blocked');
				} else {
					finish('error');
				}
			};

			try {
				speech.speak(utterance);
			} catch {
				finish('error');
			}
		});
	}

	private delay(ms: number): Promise<boolean> {
		return new Promise((resolve) => {
			let settled = false;
			const timer = setTimeout(() => {
				if (settled) return;
				settled = true;
				this.cancelPending = null;
				resolve(true);
			}, ms);

			this.cancelPending = () => {
				if (settled) return;
				settled = true;
				clearTimeout(timer);
				resolve(false);
			};
		});
	}

	async play(ids: string[], all = false): Promise<void> {
		this.stop();
		const version = this.version;
		try {
			for (const id of ids) {
				const word = await this.resolveWord(id);
				if (version !== this.version) return;
				if (!word) continue;

				this.changed({ playingId: word.id, playingAll: all, message: '' });
				const result = word.audioUrl ? await this.recorded(word.audioUrl) : await this.spoken(word);
				if (version !== this.version) return;

				if (result !== 'ok') {
					throw new Error(
						result === 'blocked'
							? 'Pemutaran otomatis diblokir oleh browser. Klik tombol dengarkan untuk memutar.'
							: word.audioUrl
								? 'Audio belum dapat diputar. Silakan coba lagi.'
								: 'Audio belum tersedia dan suara bahasa Jepang belum terpasang di perangkat ini.'
					);
				}
			}
			if (version === this.version) this.stop();
		} catch (cause) {
			if (version !== this.version) return;
			this.stop();
			this.changed({
				playingId: null,
				playingAll: false,
				message: cause instanceof Error ? cause.message : 'Pelafalan belum dapat diputar.'
			});
		}
	}

	async playSequence(
		ids: string[],
		options?: {
			delayMs?: number;
			onStep?: (id: string) => void;
		}
	): Promise<SequenceResult> {
		this.stop();
		const version = this.version;
		const delayMs = options?.delayMs ?? 750;

		try {
			for (let i = 0; i < ids.length; i++) {
				const id = ids[i];
				options?.onStep?.(id);

				const word = await this.resolveWord(id);
				if (version !== this.version) return 'cancelled';
				if (!word) continue;

				this.changed({ playingId: word.id, playingAll: true, message: '' });
				const result = word.audioUrl ? await this.recorded(word.audioUrl) : await this.spoken(word);
				if (version !== this.version) return 'cancelled';

				if (result === 'blocked') {
					this.stop();
					return 'blocked';
				}

				if (result !== 'ok') {
					throw new Error(
						word.audioUrl
							? 'Audio belum dapat diputar. Silakan coba lagi.'
							: 'Audio belum tersedia dan suara bahasa Jepang belum terpasang di perangkat ini.'
					);
				}

				if (i < ids.length - 1 && delayMs > 0) {
					const ok = await this.delay(delayMs);
					if (!ok || version !== this.version) return 'cancelled';
				}
			}

			if (version === this.version) {
				this.stop();
				return 'completed';
			}
			return 'cancelled';
		} catch (cause) {
			if (version !== this.version) return 'cancelled';
			this.stop();
			this.changed({
				playingId: null,
				playingAll: false,
				message: cause instanceof Error ? cause.message : 'Pelafalan belum dapat diputar.'
			});
			return 'failed';
		}
	}
}
