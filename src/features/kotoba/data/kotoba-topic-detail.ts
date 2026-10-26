import type { KotobaLevel } from './kotoba-topics';

export const kotobaTypes = ['Kata Benda', 'Kata Kerja', 'Kata Sifat', 'Lainnya'] as const;
export type KotobaType = (typeof kotobaTypes)[number];

export interface KotobaVocabulary {
	audioUrl?: string | null;
	id: string;
	kanji: string;
	hiragana: string;
	// Only kanji segments have a reading; kana segments render as plain text.
	furigana: {
		text: string;
		reading?: string;
	}[];
	romaji: string;
	translation: string;
	example: {
		japanese: string;
		indonesian: string;
	};
	type: KotobaType;
}

export interface KotobaTopicDetail {
	id?: string;
	coverUrl?: string;
	mediaExpiresAt?: string;
	title: string;
	level: KotobaLevel;
	description: string;
	vocabulary: KotobaVocabulary[];
}

// All topic routes share this sample until the Kotoba detail API is available.
export const exampleKotobaTopicDetail: KotobaTopicDetail = {
	title: 'Sekolah',
	level: 'N5',
	description: 'Kosakata seputar lingkungan sekolah dan kegiatan belajar.',
	vocabulary: [
		{
			id: 'gakkou',
			kanji: '学校',
			hiragana: 'がっこう',
			furigana: [{ text: '学校', reading: 'がっこう' }],
			romaji: 'gakkou',
			translation: 'sekolah',
			example: {
				japanese: 'わたしは毎日学校へ行きます。',
				indonesian: 'Saya pergi ke sekolah setiap hari.'
			},
			type: 'Kata Benda'
		},
		{
			id: 'kyoushitsu',
			kanji: '教室',
			hiragana: 'きょうしつ',
			furigana: [{ text: '教室', reading: 'きょうしつ' }],
			romaji: 'kyoushitsu',
			translation: 'ruang kelas',
			example: {
				japanese: 'ここはわたしたちの教室です。',
				indonesian: 'Ini adalah ruang kelas kami.'
			},
			type: 'Kata Benda'
		},
		{
			id: 'sensei',
			kanji: '先生',
			hiragana: 'せんせい',
			furigana: [{ text: '先生', reading: 'せんせい' }],
			romaji: 'sensei',
			translation: 'guru',
			example: {
				japanese: '先生はとてもやさしいです。',
				indonesian: 'Guru itu sangat baik.'
			},
			type: 'Kata Benda'
		},
		{
			id: 'gakusei',
			kanji: '学生',
			hiragana: 'がくせい',
			furigana: [{ text: '学生', reading: 'がくせい' }],
			romaji: 'gakusei',
			translation: 'siswa',
			example: {
				japanese: 'わたしは日本語を勉強している学生です。',
				indonesian: 'Saya adalah siswa yang sedang belajar bahasa Jepang.'
			},
			type: 'Kata Benda'
		},
		{
			id: 'hon',
			kanji: '本',
			hiragana: 'ほん',
			furigana: [{ text: '本', reading: 'ほん' }],
			romaji: 'hon',
			translation: 'buku',
			example: {
				japanese: 'この本はおもしろいです。',
				indonesian: 'Buku ini menarik.'
			},
			type: 'Kata Benda'
		},
		{
			id: 'enpitsu',
			kanji: '鉛筆',
			hiragana: 'えんぴつ',
			furigana: [{ text: '鉛筆', reading: 'えんぴつ' }],
			romaji: 'enpitsu',
			translation: 'pensil',
			example: {
				japanese: '鉛筆で名前を書きます。',
				indonesian: 'Saya menulis nama dengan pensil.'
			},
			type: 'Kata Benda'
		},
		{
			id: 'tsukue',
			kanji: '机',
			hiragana: 'つくえ',
			furigana: [{ text: '机', reading: 'つくえ' }],
			romaji: 'tsukue',
			translation: 'meja',
			example: {
				japanese: 'これはわたしの机です。',
				indonesian: 'Ini adalah meja saya.'
			},
			type: 'Kata Benda'
		},
		{
			id: 'kaban',
			kanji: '鞄',
			hiragana: 'かばん',
			furigana: [{ text: '鞄', reading: 'かばん' }],
			romaji: 'kaban',
			translation: 'tas',
			example: {
				japanese: '鞄の中に本があります。',
				indonesian: 'Ada buku di dalam tas.'
			},
			type: 'Kata Benda'
		},
		{
			id: 'yomu',
			kanji: '読む',
			hiragana: 'よむ',
			furigana: [{ text: '読', reading: 'よ' }, { text: 'む' }],
			romaji: 'yomu',
			translation: 'membaca',
			example: {
				japanese: '図書館で本を読みます。',
				indonesian: 'Saya membaca buku di perpustakaan.'
			},
			type: 'Kata Kerja'
		},
		{
			id: 'kaku',
			kanji: '書く',
			hiragana: 'かく',
			furigana: [{ text: '書', reading: 'か' }, { text: 'く' }],
			romaji: 'kaku',
			translation: 'menulis',
			example: {
				japanese: 'ノートに漢字を書きます。',
				indonesian: 'Saya menulis kanji di buku catatan.'
			},
			type: 'Kata Kerja'
		},
		{
			id: 'atarashii',
			kanji: '新しい',
			hiragana: 'あたらしい',
			furigana: [{ text: '新', reading: 'あたら' }, { text: 'しい' }],
			romaji: 'atarashii',
			translation: 'baru',
			example: {
				japanese: '新しい教科書を買いました。',
				indonesian: 'Saya sudah membeli buku pelajaran baru.'
			},
			type: 'Kata Sifat'
		},
		{
			id: 'mainichi',
			kanji: '毎日',
			hiragana: 'まいにち',
			furigana: [{ text: '毎日', reading: 'まいにち' }],
			romaji: 'mainichi',
			translation: 'setiap hari',
			example: {
				japanese: '毎日日本語を勉強します。',
				indonesian: 'Saya belajar bahasa Jepang setiap hari.'
			},
			type: 'Lainnya'
		}
	]
};
