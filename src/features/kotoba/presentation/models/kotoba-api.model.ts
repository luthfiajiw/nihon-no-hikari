import type { KotobaTopicRecord } from '../../domain/entities/kotoba-api.entity';
import type { KotobaTopic } from '../../data/kotoba-topics';
import type { KotobaTopicDetail } from '../../data/kotoba-topic-detail';

export function topicSummary(record: KotobaTopicRecord): KotobaTopic {
	return {
		id: record.id,
		title: record.title,
		level: record.level,
		category: record.category,
		description: record.description,
		vocabularyCount: record.vocabulary_count,
		exerciseCount: record.exercise_count,
		createdAt: Date.parse(record.created_at),
		coverUrl: record.cover_url,
		mediaExpiresAt: record.media_urls_expires_at
	};
}
export function topicDetail(record: KotobaTopicRecord): KotobaTopicDetail {
	return {
		id: record.id,
		title: record.title,
		level: record.level,
		description: record.description,
		coverUrl: record.cover_url,
		mediaExpiresAt: record.media_urls_expires_at,
		vocabulary: (record.vocabulary ?? []).map((word) => ({
			id: word.id,
			kanji: word.kanji,
			hiragana: word.hiragana,
			furigana: word.furigana,
			romaji: word.romaji,
			translation: word.translation,
			example: word.example,
			type: word.type,
			audioUrl: word.audio_url
		}))
	};
}
export function mediaNeedsRefresh(expiresAt?: string): boolean {
	return (
		!expiresAt ||
		!Number.isFinite(Date.parse(expiresAt)) ||
		Date.parse(expiresAt) - Date.now() < 60_000
	);
}
