import type { KotobaCategory, KotobaLevel } from '../../data/kotoba-topics';
import type { KotobaVocabulary } from '../../data/kotoba-topic-detail';

export interface KotobaMediaRecord {
	id: string;
	kind: 'cover' | 'audio';
	url: string;
	url_expires_at?: string;
	mime_type: string;
	size_bytes: number;
}
export interface KotobaWordRecord extends Omit<KotobaVocabulary, 'audioUrl'> {
	order_index: number;
	audio_media_id?: string | null;
	audio_url: string | null;
}
export interface KotobaTopicRecord {
	id: string;
	title: string;
	level: KotobaLevel;
	category: KotobaCategory;
	description: string;
	order_index: number;
	is_active?: boolean;
	is_visible?: boolean;
	cover_media_id?: string;
	cover_url: string;
	media_urls_expires_at?: string;
	version?: number;
	vocabulary_count: number;
	exercise_count: number;
	created_at: string;
	updated_at: string;
	vocabulary?: KotobaWordRecord[];
}
export interface KotobaTopicInput {
	title: string;
	level: KotobaLevel;
	category: KotobaCategory;
	description: string;
	order_index: number;
	is_active: boolean;
	is_visible: boolean;
	cover_media_id: string;
	version?: number;
	vocabulary: (Omit<KotobaWordRecord, 'id' | 'order_index' | 'audio_url'> & { id?: string })[];
}
export class KotobaError extends Error {
	constructor(
		public readonly status: number,
		message: string,
		public readonly fieldErrors: Record<string, string> = {}
	) {
		super(message);
	}
}
