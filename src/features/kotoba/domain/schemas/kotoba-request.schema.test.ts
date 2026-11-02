import { describe, expect, it } from 'vitest';
import { createKotobaTopicSchema } from './kotoba-request.schema';
import { kotobaTypes } from '../../data/kotoba-topic-detail';

const word = {
	kanji: '学校',
	hiragana: 'がっこう',
	romaji: 'gakkou',
	translation: 'sekolah',
	furigana: [],
	example: { japanese: '学校へ行きます。', indonesian: 'Saya pergi ke sekolah.' },
	audio_media_id: null
};
const topic = (vocabulary: Record<string, unknown>[]) => ({
	title: 'Sekolah',
	description: 'Kosakata sekolah',
	level: 'N5',
	category: 'Dasar',
	order_index: 1,
	is_active: true,
	is_visible: true,
	cover_media_id: '11111111-1111-4111-8111-111111111111',
	vocabulary
});

describe('kotoba vocabulary type', () => {
	it.each(kotobaTypes)('accepts %s', (type) => {
		const parsed = createKotobaTopicSchema.parse(topic([{ ...word, type }]));
		expect(parsed.vocabulary[0].type).toBe(type);
	});

	it('defaults a missing type to other', () => {
		const parsed = createKotobaTopicSchema.parse(topic([word]));
		expect(parsed.vocabulary[0].type).toBe('other');
	});

	it.each(['Kata Benda', 'Lainnya', 'unknown'])('rejects legacy or unknown type %s', (type) => {
		expect(createKotobaTopicSchema.safeParse(topic([{ ...word, type }])).success).toBe(false);
	});
});
