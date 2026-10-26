import {
	KotobaError,
	type KotobaTopicInput,
	type KotobaTopicRecord
} from '$features/kotoba/domain/entities/kotoba-api.entity';
import type { KotobaRepository } from '$features/kotoba/domain/repositories/kotoba.repository';
import { topicSummary } from '$features/kotoba/presentation/models/kotoba-api.model';
import { wholeWordFurigana, type AdminKotobaTopic, type KotobaMedia } from './admin-kotoba.model';

export function adminTopic(record: KotobaTopicRecord): AdminKotobaTopic {
	return {
		...topicSummary(record),
		order: record.order_index,
		active: !!record.is_active,
		visible: !!record.is_visible,
		version: record.version ?? 0,
		cover: record.cover_media_id
			? {
					mediaId: record.cover_media_id,
					url: record.cover_url,
					expiresAt: record.media_urls_expires_at,
					file: null
				}
			: null,
		vocabulary: (record.vocabulary ?? []).map((word) => ({
			id: word.id,
			serverId: word.id,
			kanji: word.kanji,
			hiragana: word.hiragana,
			furigana: word.furigana,
			romaji: word.romaji,
			translation: word.translation,
			example: word.example,
			type: word.type,
			audio: word.audio_media_id
				? {
						mediaId: word.audio_media_id,
						url: word.audio_url ?? '',
						expiresAt: record.media_urls_expires_at,
						file: null
					}
				: null
		}))
	};
}
export function topicPayload(topic: AdminKotobaTopic): KotobaTopicInput {
	return {
		title: topic.title,
		level: topic.level,
		category: topic.category,
		description: topic.description,
		order_index: topic.order,
		is_active: topic.active,
		is_visible: topic.visible,
		cover_media_id: topic.cover?.mediaId ?? '',
		...(topic.id !== 'new' ? { version: topic.version } : {}),
		vocabulary: topic.vocabulary.map((word) => ({
			...(word.serverId ? { id: word.serverId } : {}),
			kanji: word.kanji,
			hiragana: word.hiragana,
			furigana: word.furigana.length ? word.furigana : wholeWordFurigana(word),
			romaji: word.romaji,
			translation: word.translation,
			example: word.example,
			type: word.type,
			audio_media_id: word.audio?.mediaId ?? null
		}))
	};
}

// Update each successful upload in-place. A retry retains media IDs and Files,
// including when a later upload or the topic save fails.
export async function saveAdminTopic(
	repository: KotobaRepository,
	topic: AdminKotobaTopic,
	progress: (message: string) => void = () => {}
) {
	const files = new Map<File, KotobaMedia>();
	async function upload(media: KotobaMedia | null, kind: 'cover' | 'audio') {
		if (!media || media.mediaId || !media.file) return;
		const cached = files.get(media.file);
		if (cached) {
			Object.assign(media, {
				mediaId: cached.mediaId,
				url: cached.url,
				expiresAt: cached.expiresAt
			});
			return;
		}
		const result = await repository.upload(kind, media.file);
		Object.assign(media, { mediaId: result.id, url: result.url, expiresAt: result.url_expires_at });
		files.set(media.file, media);
	}
	progress('Mengunggah cover...');
	await upload(topic.cover, 'cover');
	for (const [index, word] of topic.vocabulary.entries()) {
		progress(`Menyiapkan audio ${index + 1} dari ${topic.vocabulary.length}...`);
		await upload(word.audio, 'audio');
	}
	progress('Menyimpan topik...');
	return adminTopic(
		await repository.save(topic.id === 'new' ? null : topic.id, topicPayload(topic))
	);
}
export function editorFieldErrors(
	cause: KotobaError,
	topic: AdminKotobaTopic
): Record<string, string> {
	const fields: Record<string, string> = {};
	for (const [path, message] of Object.entries(cause.fieldErrors)) {
		const word = path.match(/^vocabulary\.(\d+)\.(.+)$/);
		if (word && topic.vocabulary[Number(word[1])])
			fields[
				`${topic.vocabulary[Number(word[1])].id}.${word[2].replace(/^example\./, '').replace('audio_media_id', 'audio')}`
			] = message;
		else
			fields[path === 'cover_media_id' ? 'cover' : path === 'order_index' ? 'order' : path] =
				message;
	}
	return fields;
}
export function refreshEditorMedia(topic: AdminKotobaTopic, fresh: AdminKotobaTopic) {
	const media = new Map<string, KotobaMedia>();
	for (const item of [fresh.cover, ...fresh.vocabulary.map((word) => word.audio)])
		if (item?.mediaId) media.set(item.mediaId, item);
	for (const item of [topic.cover, ...topic.vocabulary.map((word) => word.audio)]) {
		const replacement = item?.mediaId ? media.get(item.mediaId) : undefined;
		if (item && replacement && !item.file) {
			item.url = replacement.url;
			item.expiresAt = replacement.expiresAt;
		}
	}
	topic.mediaExpiresAt = fresh.mediaExpiresAt;
}
