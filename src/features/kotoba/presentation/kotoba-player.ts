import type { KotobaVocabulary } from '../data/kotoba-topic-detail';

type PlaybackState = { playingId: string | null; playingAll: boolean; message: string };
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
	private recorded(url: string): Promise<boolean> {
		return new Promise((resolve) => {
			const audio = this.createAudio();
			this.audio = audio;
			let settled = false;
			const finish = (ok: boolean) => {
				if (settled) return;
				settled = true;
				audio.onended = null;
				audio.onerror = null;
				audio.pause();
				audio.removeAttribute('src');
				audio.load();
				if (this.audio === audio) this.audio = null;
				this.cancelPending = null;
				resolve(ok);
			};
			this.cancelPending = () => finish(false);
			audio.onended = () => finish(true);
			audio.onerror = () => finish(false);
			audio.src = url;
			void audio.play().catch(() => finish(false));
		});
	}
	private spoken(word: KotobaVocabulary): Promise<boolean> {
		const speech = this.speech();
		const voice = speech?.getVoices().find((item) => item.lang.startsWith('ja'));
		if (!speech || !voice || typeof SpeechSynthesisUtterance === 'undefined')
			return Promise.resolve(false);
		return new Promise((resolve) => {
			const utterance = new SpeechSynthesisUtterance(word.hiragana);
			let settled = false;
			const finish = (ok: boolean) => {
				if (settled) return;
				settled = true;
				utterance.onend = null;
				utterance.onerror = null;
				this.cancelPending = null;
				resolve(ok);
			};
			this.cancelPending = () => finish(false);
			utterance.lang = 'ja-JP';
			utterance.voice = voice;
			utterance.rate = 0.8;
			utterance.onend = () => finish(true);
			utterance.onerror = () => finish(false);
			speech.speak(utterance);
		});
	}
	async play(ids: string[], all = false) {
		this.stop();
		const version = this.version;
		try {
			for (const id of ids) {
				const word = await this.resolveWord(id);
				if (version !== this.version) return;
				if (!word) continue;
				this.changed({ playingId: word.id, playingAll: all, message: '' });
				const ok = word.audioUrl ? await this.recorded(word.audioUrl) : await this.spoken(word);
				if (version !== this.version) return;
				if (!ok)
					throw new Error(
						word.audioUrl
							? 'Audio belum dapat diputar. Silakan coba lagi.'
							: 'Audio belum tersedia dan suara bahasa Jepang belum terpasang di perangkat ini.'
					);
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
}
