import type { KotobaTopic } from '$features/kotoba/data/kotoba-topics';
import type { KotobaVocabulary } from '$features/kotoba/data/kotoba-topic-detail';

export interface KotobaMedia {
	mediaId?: string;
	expiresAt?: string;
	url: string;
	file: File | null;
}

export interface AdminKotobaVocabulary extends KotobaVocabulary {
	serverId?: string;
	audio: KotobaMedia | null;
}

export interface AdminKotobaTopic extends Omit<KotobaTopic, 'vocabularyCount'> {
	version?: number;
	vocabularyCount?: number;
	order: number;
	active: boolean;
	visible: boolean;
	cover: KotobaMedia | null;
	vocabulary: AdminKotobaVocabulary[];
}

export type KotobaErrors = Record<string, string>;
export const MAX_COVER_BYTES = 2 * 1024 * 1024;
export const MAX_AUDIO_BYTES = 1024 * 1024;

export function emptyVocabulary(id: string): AdminKotobaVocabulary {
	return {
		id,
		kanji: '',
		hiragana: '',
		furigana: [],
		romaji: '',
		translation: '',
		example: { japanese: '', indonesian: '' },
		type: 'Kata Benda',
		audio: null
	};
}

export function emptyTopic(order: number): AdminKotobaTopic {
	return {
		id: 'new',
		title: '',
		level: 'N5',
		category: 'Dasar',
		description: '',
		exerciseCount: 0,
		createdAt: 0,
		order,
		active: false,
		visible: true,
		cover: null,
		vocabulary: [emptyVocabulary('new-word')]
	};
}

// Copy nested values explicitly: reactive proxies cannot be passed to structuredClone.
// Files are immutable and stay in this browser's layout context, never in server state.
export function cloneVocabulary(word: AdminKotobaVocabulary): AdminKotobaVocabulary {
	return {
		...word,
		example: { ...word.example },
		furigana: word.furigana.map((part) => ({ ...part })),
		audio: word.audio ? { ...word.audio } : null
	};
}

export function cloneTopic(topic: AdminKotobaTopic): AdminKotobaTopic {
	return {
		...topic,
		cover: topic.cover ? { ...topic.cover } : null,
		vocabulary: topic.vocabulary.map(cloneVocabulary)
	};
}

export function wholeWordFurigana(word: Pick<KotobaVocabulary, 'kanji' | 'hiragana'>) {
	return [{ text: word.kanji, reading: word.hiragana === word.kanji ? undefined : word.hiragana }];
}

export function validateTopic(topic: AdminKotobaTopic): KotobaErrors {
	const errors: KotobaErrors = {};
	if (!topic.title.trim()) errors.title = 'Nama topik wajib diisi.';
	if (!topic.description.trim()) errors.description = 'Deskripsi topik wajib diisi.';
	if (topic.description.length > 200) errors.description = 'Deskripsi maksimal 200 karakter.';
	if (!Number.isInteger(topic.order) || topic.order < 1) errors.order = 'Urutan minimal 1.';
	if (!topic.cover) errors.cover = 'Pilih gambar cover untuk topik ini.';
	if (!topic.vocabulary.length) errors.vocabulary = 'Tambahkan minimal satu kosakata.';
	for (const word of topic.vocabulary) {
		const required = {
			kanji: ['Kata Jepang', word.kanji],
			hiragana: ['Hiragana / kana', word.hiragana],
			romaji: ['Romaji', word.romaji],
			translation: ['Arti Indonesia', word.translation],
			japanese: ['Contoh kalimat Jepang', word.example.japanese],
			indonesian: ['Terjemahan Indonesia', word.example.indonesian]
		};
		for (const [field, [label, value]] of Object.entries(required)) {
			if (!value.trim()) errors[`${word.id}.${field}`] = `${label} wajib diisi.`;
		}
		if (
			word.furigana.length &&
			(word.furigana.some((part) => !part.text.trim()) ||
				word.furigana.map((part) => part.text).join('') !== word.kanji)
		) {
			errors[`${word.id}.furigana`] = 'Gabungan teks segmen harus sama dengan kata Jepang.';
		}
	}
	return errors;
}

export function validateMedia(file: File, kind: 'cover' | 'audio'): string {
	if (!file.size) return 'File kosong. Pilih file lain.';
	if (file.size > (kind === 'cover' ? MAX_COVER_BYTES : MAX_AUDIO_BYTES)) {
		return kind === 'cover' ? 'Ukuran gambar maksimal 2 MiB.' : 'Ukuran audio maksimal 1 MiB.';
	}
	const allowedTypes = kind === 'cover' ? ['image/png', 'image/jpeg'] : ['audio/mpeg', 'audio/mp3'];
	const extension = kind === 'cover' ? /\.(png|jpe?g)$/i : /\.mp3$/i;
	if (!extension.test(file.name) || (file.type && !allowedTypes.includes(file.type))) {
		return kind === 'cover' ? 'Gunakan gambar PNG atau JPG.' : 'Gunakan audio berformat MP3.';
	}
	return '';
}
