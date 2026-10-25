import { afterEach, describe, expect, it, vi } from 'vitest';
import { AzureLessonSpeech } from './azure';

interface FakeSynth {
	wordBoundary?: (
		sender: unknown,
		event: {
			audioOffset: number;
			duration: number;
			textOffset: number;
			wordLength: number;
			boundaryType: number;
		}
	) => void;
	complete?: (result: { reason: number; audioData: ArrayBuffer }) => void;
	close: ReturnType<typeof vi.fn>;
}
const mock = vi.hoisted(() => ({ instances: [] as FakeSynth[] }));
vi.mock('microsoft-cognitiveservices-speech-sdk', () => ({
	SpeechConfig: { fromAuthorizationToken: vi.fn(() => ({ setProperty: vi.fn() })) },
	SpeechSynthesisOutputFormat: { Riff24Khz16BitMonoPcm: 1 },
	PropertyId: { SpeechServiceResponse_RequestWordBoundary: 1 },
	SpeechSynthesisBoundaryType: { Word: 1 },
	ResultReason: { SynthesizingAudioCompleted: 1 },
	SpeechSynthesizer: class {
		close = vi.fn();
		complete?: FakeSynth['complete'];
		constructor() {
			mock.instances.push(this);
		}
		speakTextAsync(_text: string, complete: FakeSynth['complete']) {
			this.complete = complete;
		}
	}
}));

afterEach(() => {
	mock.instances.length = 0;
	vi.useRealTimers();
});
const credentials = () => ({
	token: 'temporary',
	region: 'southeastasia',
	expires_at: new Date(Date.now() + 540_000).toISOString()
});

describe('Azure lesson synthesis', () => {
	it('times out stalled synthesis and closes its connection', async () => {
		const azure = new AzureLessonSpeech(async () => credentials());
		const pending = azure.synthesize('baca', 'id-ID-GadisNeural', new AbortController().signal);
		await vi.waitFor(() => expect(mock.instances).toHaveLength(1));
		// The timeout was registered with real timers; fake its scheduling for a second synthesis.
		mock.instances[0].complete?.({ reason: 1, audioData: new ArrayBuffer(10) });
		await pending;
		vi.useFakeTimers();
		const stalled = azure.synthesize('lama', 'id-ID-GadisNeural', new AbortController().signal);
		const rejected = expect(stalled).rejects.toThrow('terlalu lama');
		await vi.waitFor(() => expect(mock.instances).toHaveLength(2));
		await vi.advanceTimersByTimeAsync(45_000);
		await rejected;
		expect(mock.instances[1].close).toHaveBeenCalledOnce();
	});
	it('collects word timing before playback, ignores non-word/invalid offsets, and reuses then refreshes tokens', async () => {
		const fetch = vi.fn().mockImplementation(async () => credentials());
		const azure = new AzureLessonSpeech(fetch);
		const first = azure.synthesize(
			'🎯 baca あい',
			'id-ID-GadisNeural',
			new AbortController().signal
		);
		await vi.waitFor(() => expect(mock.instances).toHaveLength(1));
		const instance = mock.instances[0];
		instance.wordBoundary?.(null, {
			audioOffset: 5_000_000,
			duration: 2_000_000,
			textOffset: 3,
			wordLength: 4,
			boundaryType: 1
		});
		instance.wordBoundary?.(null, {
			audioOffset: 0,
			duration: 0,
			textOffset: -1,
			wordLength: 4,
			boundaryType: 1
		});
		instance.wordBoundary?.(null, {
			audioOffset: 0,
			duration: 0,
			textOffset: 0,
			wordLength: 2,
			boundaryType: 2
		});
		instance.complete?.({ reason: 1, audioData: new ArrayBuffer(10) });
		expect((await first).words).toEqual([{ start: 0.5, duration: 0.2, offset: 3, length: 4 }]);
		expect(instance.close).toHaveBeenCalledOnce();
		const second = azure.synthesize('あい', 'ja-JP-NanamiNeural', new AbortController().signal);
		await vi.waitFor(() => expect(mock.instances).toHaveLength(2));
		mock.instances[1].complete?.({ reason: 1, audioData: new ArrayBuffer(10) });
		await second;
		expect(fetch).toHaveBeenCalledOnce();
		const clock = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 540_000);
		const third = azure.synthesize('baca', 'id-ID-GadisNeural', new AbortController().signal);
		await vi.waitFor(() => expect(mock.instances).toHaveLength(3));
		mock.instances[2].complete?.({ reason: 1, audioData: new ArrayBuffer(10) });
		await third;
		expect(fetch).toHaveBeenCalledTimes(2);
		clock.mockRestore();
	});

	it('cancels synthesis, closes the connection and ignores a late success callback', async () => {
		const azure = new AzureLessonSpeech(async () => credentials());
		const abort = new AbortController();
		const pending = azure.synthesize('baca', 'id-ID-GadisNeural', abort.signal);
		const rejected = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
		await vi.waitFor(() => expect(mock.instances).toHaveLength(1));
		abort.abort();
		await rejected;
		mock.instances[0].complete?.({ reason: 1, audioData: new ArrayBuffer(10) });
		expect(mock.instances[0].close).toHaveBeenCalledOnce();
	});

	it('rejects expired credentials without opening an Azure connection', async () => {
		const azure = new AzureLessonSpeech(async () => ({
			...credentials(),
			expires_at: new Date(0).toISOString()
		}));
		await expect(
			azure.synthesize('baca', 'id-ID-GadisNeural', new AbortController().signal)
		).rejects.toThrow('kedaluwarsa');
		expect(mock.instances).toHaveLength(0);
	});
});
