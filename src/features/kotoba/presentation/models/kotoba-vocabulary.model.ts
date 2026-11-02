import {
	kotobaTypes,
	type KotobaType,
	type KotobaVocabulary
} from '../../data/kotoba-topic-detail';

export const kotobaSortValues = ['default', 'romaji', 'translation'] as const;
export type KotobaSortOption = (typeof kotobaSortValues)[number];

export const kotobaSortOptions: { value: KotobaSortOption; label: string }[] = [
	{ value: 'default', label: 'Default' },
	{ value: 'romaji', label: 'Romaji A–Z' },
	{ value: 'translation', label: 'Arti A–Z' }
];

export interface KotobaVocabularyQuery {
	type: KotobaType | 'Semua';
	search: string;
	sort: KotobaSortOption;
}

export const kotobaTypeBadgeClasses: Record<KotobaType, string> = {
	noun: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
	verb: 'border-taupe-200 bg-taupe-50 text-taupe-700 dark:border-taupe-800 dark:bg-taupe-950/40 dark:text-taupe-300',
	adjective:
		'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
	adverb:
		'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
	question_word:
		'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
	family_member:
		'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300',
	counter:
		'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300',
	day_date_month:
		'border-lime-200 bg-lime-50 text-lime-700 dark:border-lime-800 dark:bg-lime-950/40 dark:text-lime-300',
	other:
		'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300'
};

export function filterKotobaVocabulary(
	vocabulary: KotobaVocabulary[],
	{ type, search, sort }: KotobaVocabularyQuery
): KotobaVocabulary[] {
	const query = search.trim().toLocaleLowerCase('id');
	return vocabulary
		.filter((word) => type === 'Semua' || word.type === type)
		.filter((word) =>
			!query
				? true
				: [
						word.kanji,
						word.hiragana,
						word.romaji,
						word.translation,
						word.example.japanese,
						word.example.indonesian
					].some((value) => value.toLocaleLowerCase('id').includes(query))
		)
		.sort((a, b) => {
			if (sort === 'romaji') return a.romaji.localeCompare(b.romaji, 'id');
			if (sort === 'translation') return a.translation.localeCompare(b.translation, 'id');
			return 0;
		});
}

export function parseKotobaVocabularyQuery(searchParams: URLSearchParams): KotobaVocabularyQuery {
	const rawType = searchParams.get('type');
	const type =
		rawType && (kotobaTypes as readonly string[]).includes(rawType)
			? (rawType as KotobaType)
			: 'Semua';
	const search = searchParams.get('q') ?? '';
	const rawSort = searchParams.get('sort');
	const sort =
		rawSort && (kotobaSortValues as readonly string[]).includes(rawSort)
			? (rawSort as KotobaSortOption)
			: 'default';
	return { type, search, sort };
}

export function buildKotobaPlaySearch({ type, search, sort }: KotobaVocabularyQuery): string {
	const params = new URLSearchParams();
	if (type !== 'Semua') params.set('type', type);
	if (search.trim()) params.set('q', search.trim());
	if (sort !== 'default') params.set('sort', sort);
	const encoded = params.toString();
	return encoded ? `?${encoded}` : '';
}
