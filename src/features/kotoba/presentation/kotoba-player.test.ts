import { describe, it, expect, vi } from 'vitest';
import { KotobaPlayer } from './kotoba-player';
import type { KotobaVocabulary } from '../data/kotoba-topic-detail';

function fakeAudio() {
	return {
		src: '',
		onended: null as (() => void) | null,
		onerror: null as (() => void) | null,
		play: vi.fn(async () => {}),
		pause: vi.fn(),
		removeAttribute: vi.fn(),
		load: vi.fn()
	};
}
const word = (id: string): KotobaVocabulary => ({
	id,
	kanji: '学校',
	hiragana: 'がっこう',
	furigana: [],
	romaji: 'gakkou',
	translation: 'sekolah',
	type: 'Kata Benda',
	example: { japanese: '', indonesian: '' },
	audioUrl: `https://storage.test/${id}?token=new`
});
describe('Kotoba recorded playback', () => {
	it('plays signed MP3 URLs in order without requiring browser speech', async () => {
		const audios: ReturnType<typeof fakeAudio>[] = [];
		const resolve = vi.fn(async (id: string) => word(id));
		const changed = vi.fn();
		const player = new KotobaPlayer(
			changed,
			resolve,
			() => {
				const audio = fakeAudio();
				audios.push(audio);
				return audio as unknown as HTMLAudioElement;
			},
			() => undefined
		);
		const playing = player.play(['one', 'two'], true);
		await vi.waitFor(() => expect(audios).toHaveLength(1));
		expect(audios[0].src).toContain('/one?token=new');
		audios[0].onended!();
		await vi.waitFor(() => expect(audios).toHaveLength(2));
		expect(audios[1].src).toContain('/two?token=new');
		audios[1].onended!();
		await playing;
		expect(changed).toHaveBeenLastCalledWith({ playingId: null, playingAll: false, message: '' });
	});
	it('stops playback and prevents a cancelled queue from starting another word', async () => {
		const audio = fakeAudio();
		const resolve = vi.fn(async (id: string) => word(id));
		const player = new KotobaPlayer(
			vi.fn(),
			resolve,
			() => audio as unknown as HTMLAudioElement,
			() => undefined
		);
		const playing = player.play(['one', 'two'], true);
		await vi.waitFor(() => expect(audio.play).toHaveBeenCalledOnce());
		player.stop();
		await playing;
		expect(resolve).toHaveBeenCalledTimes(1);
		expect(audio.pause).toHaveBeenCalled();
	});
});
