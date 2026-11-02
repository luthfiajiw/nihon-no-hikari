import { describe, expect, it } from 'vitest';
import {
	buildKotobaPlaySearch,
	filterKotobaVocabulary,
	parseKotobaVocabularyQuery
} from './kotoba-vocabulary.model';
import type { KotobaVocabulary } from '../../data/kotoba-topic-detail';

const sampleWords: KotobaVocabulary[] = [
	{
		id: '1',
		kanji: '学校',
		hiragana: 'がっこう',
		furigana: [{ text: '学校', reading: 'がっこう' }],
		romaji: 'gakkou',
		translation: 'sekolah',
		type: 'noun',
		example: { japanese: '学校へ行きます。', indonesian: 'Pergi ke sekolah.' }
	},
	{
		id: '2',
		kanji: '食べる',
		hiragana: 'たべる',
		furigana: [{ text: '食', reading: 'た' }, { text: 'べる' }],
		romaji: 'taberu',
		translation: 'makan',
		type: 'verb',
		example: { japanese: 'ご飯を食べます。', indonesian: 'Makan nasi.' }
	},
	{
		id: '3',
		kanji: '新しい',
		hiragana: 'あたらしい',
		furigana: [{ text: '新', reading: 'あたら' }, { text: 'しい' }],
		romaji: 'atarashii',
		translation: 'baru',
		type: 'adjective',
		example: { japanese: '新しい本。', indonesian: 'Buku baru.' }
	}
];

describe('kotoba-vocabulary.model', () => {
	it('filters vocabulary by type, search, and sorts accordingly', () => {
		const nounResult = filterKotobaVocabulary(sampleWords, {
			type: 'noun',
			search: '',
			sort: 'default'
		});
		expect(nounResult).toHaveLength(1);
		expect(nounResult[0].id).toBe('1');

		const searchResult = filterKotobaVocabulary(sampleWords, {
			type: 'Semua',
			search: 'makan',
			sort: 'default'
		});
		expect(searchResult).toHaveLength(1);
		expect(searchResult[0].id).toBe('2');

		const romajiSorted = filterKotobaVocabulary(sampleWords, {
			type: 'Semua',
			search: '',
			sort: 'romaji'
		});
		expect(romajiSorted.map((w) => w.romaji)).toEqual(['atarashii', 'gakkou', 'taberu']);

		const translationSorted = filterKotobaVocabulary(sampleWords, {
			type: 'Semua',
			search: '',
			sort: 'translation'
		});
		expect(translationSorted.map((w) => w.translation)).toEqual(['baru', 'makan', 'sekolah']);
	});

	it('parses vocabulary query from URLSearchParams', () => {
		const emptyParams = new URLSearchParams('');
		expect(parseKotobaVocabularyQuery(emptyParams)).toEqual({
			type: 'Semua',
			search: '',
			sort: 'default'
		});

		const validParams = new URLSearchParams('type=verb&q=makan&sort=romaji');
		expect(parseKotobaVocabularyQuery(validParams)).toEqual({
			type: 'verb',
			search: 'makan',
			sort: 'romaji'
		});

		const invalidParams = new URLSearchParams('type=invalid&sort=unknown');
		expect(parseKotobaVocabularyQuery(invalidParams)).toEqual({
			type: 'Semua',
			search: '',
			sort: 'default'
		});
	});

	it('builds search string from query', () => {
		expect(
			buildKotobaPlaySearch({
				type: 'Semua',
				search: '',
				sort: 'default'
			})
		).toBe('');

		expect(
			buildKotobaPlaySearch({
				type: 'verb',
				search: 'taberu',
				sort: 'romaji'
			})
		).toBe('?type=verb&q=taberu&sort=romaji');
	});
});
