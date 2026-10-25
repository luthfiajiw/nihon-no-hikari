import type { LessonSpeechToken } from '$features/course/data/sources/lesson-speech.source';

export interface WordBoundary {
	start: number;
	duration: number;
	offset: number;
	length: number;
}

export interface SynthesizedSpeech {
	audio: ArrayBuffer;
	words: WordBoundary[];
}

export type Synthesize = (
	text: string,
	voice: string,
	signal: AbortSignal
) => Promise<SynthesizedSpeech>;
type FetchToken = (signal: AbortSignal) => Promise<LessonSpeechToken>;

export class AzureLessonSpeech {
	private token?: LessonSpeechToken;
	private tokenPromise?: Promise<LessonSpeechToken>;
	constructor(private readonly fetchToken: FetchToken) {}

	private async credentials(signal: AbortSignal) {
		if (this.token && Date.parse(this.token.expires_at) > Date.now() + 5000) return this.token;
		if (!this.tokenPromise) {
			const promise = this.fetchToken(signal)
				.then((token) => {
					signal.throwIfAborted();
					if (Date.parse(token.expires_at) <= Date.now())
						throw new Error('Token suara kedaluwarsa. Silakan coba lagi.');
					this.token = token;
					return token;
				})
				.finally(() => {
					if (this.tokenPromise === promise) this.tokenPromise = undefined;
				});
			this.tokenPromise = promise;
			// A new playback must not reuse a request cancelled by the previous playback.
			signal.addEventListener(
				'abort',
				() => {
					if (this.tokenPromise === promise) this.tokenPromise = undefined;
				},
				{ once: true }
			);
		}
		return this.tokenPromise!;
	}

	synthesize: Synthesize = async (text, voice, signal) => {
		const [sdk, token] = await Promise.all([
			import('microsoft-cognitiveservices-speech-sdk'),
			this.credentials(signal)
		]);
		signal.throwIfAborted();
		const config = sdk.SpeechConfig.fromAuthorizationToken(token.token, token.region);
		config.speechSynthesisVoiceName = voice;
		config.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm;
		config.setProperty(sdk.PropertyId.SpeechServiceResponse_RequestWordBoundary, 'true');
		const synthesizer = new sdk.SpeechSynthesizer(config, null);
		return new Promise<SynthesizedSpeech>((resolve, reject) => {
			let settled = false;
			const words: WordBoundary[] = [];
			const finish = (error?: Error, audio?: ArrayBuffer) => {
				if (settled) return;
				settled = true;
				clearTimeout(timeout);
				signal.removeEventListener('abort', abort);
				synthesizer.close();
				if (error) reject(error);
				else resolve({ audio: audio!, words: words.sort((a, b) => a.start - b.start) });
			};
			const abort = () => finish(new DOMException('Pembacaan dibatalkan.', 'AbortError'));
			const timeout = setTimeout(
				() => finish(new Error('Layanan suara terlalu lama merespons. Silakan coba lagi.')),
				45_000
			);
			signal.addEventListener('abort', abort, { once: true });
			synthesizer.wordBoundary = (_, event) => {
				if (
					!settled &&
					event.boundaryType === sdk.SpeechSynthesisBoundaryType.Word &&
					event.wordLength > 0 &&
					event.textOffset >= 0 &&
					event.textOffset + event.wordLength <= text.length
				) {
					words.push({
						start: event.audioOffset / 10_000_000,
						duration: event.duration / 10_000_000,
						offset: event.textOffset,
						length: event.wordLength
					});
				}
			};
			try {
				synthesizer.speakTextAsync(
					text,
					(result) => {
						if (
							result.reason === sdk.ResultReason.SynthesizingAudioCompleted &&
							result.audioData.byteLength
						) {
							finish(undefined, result.audioData);
						} else {
							this.token = undefined;
							finish(new Error('Suara gagal dibuat. Silakan coba lagi.'));
						}
					},
					() => finish(new Error('Gagal terhubung ke layanan suara. Silakan coba lagi.'))
				);
			} catch {
				finish(new Error('Gagal menyiapkan pembacaan. Silakan coba lagi.'));
			}
		});
	};
}
