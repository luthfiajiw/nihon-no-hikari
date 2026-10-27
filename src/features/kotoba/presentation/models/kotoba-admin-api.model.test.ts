import { describe, it, expect, vi } from 'vitest';
import {
	emptyKotobaAdminTopic,
	cloneKotobaAdminVocabulary
} from '$features/kotoba/presentation/models/kotoba-admin.model';
import {
	kotobaAdminTopic,
	kotobaAdminFieldErrors,
	refreshKotobaAdminMedia,
	saveKotobaAdminTopic,
	kotobaAdminTopicPayload
} from '$features/kotoba/presentation/models/kotoba-admin-api.model';
import {
	KotobaError,
	type KotobaTopicRecord
} from '$features/kotoba/domain/entities/kotoba-api.entity';
import type { KotobaRepository } from '$features/kotoba/domain/repositories/kotoba.repository';

export const record: KotobaTopicRecord = {
	id: '11111111-1111-4111-8111-111111111111',
	title: 'Sekolah',
	level: 'N5',
	category: 'Dasar',
	description: 'Sekolah',
	order_index: 1,
	is_active: true,
	is_visible: true,
	cover_media_id: '22222222-2222-4222-8222-222222222222',
	cover_url: 'https://storage.test/cover?token=old',
	version: 3,
	media_urls_expires_at: '2026-10-26T12:15:00Z',
	vocabulary_count: 1,
	exercise_count: 0,
	created_at: '2026-10-26T12:00:00Z',
	updated_at: '2026-10-26T12:00:00Z',
	vocabulary: [
		{
			id: '33333333-3333-4333-8333-333333333333',
			kanji: '学校',
			hiragana: 'がっこう',
			furigana: [{ text: '学校', reading: 'がっこう' }],
			romaji: 'gakkou',
			translation: 'sekolah',
			example: { japanese: '学校へ行きます。', indonesian: 'Pergi ke sekolah.' },
			type: 'Kata Benda',
			order_index: 1,
			audio_media_id: null,
			audio_url: null
		}
	]
};
describe('Kotoba editor integration', () => {
	it('keeps persisted IDs while copies become new words and supports null audio', () => {
		const topic = kotobaAdminTopic(record);
		const duplicate = {
			...cloneKotobaAdminVocabulary(topic.vocabulary[0]),
			id: 'local-copy',
			serverId: undefined
		};
		topic.vocabulary.unshift(duplicate);
		const input = kotobaAdminTopicPayload(topic);
		expect(input.version).toBe(3);
		expect(input.vocabulary[0].id).toBeUndefined();
		expect(input.vocabulary[1].id).toBe(record.vocabulary![0].id);
		expect(input.vocabulary[1].audio_media_id).toBeNull();
		expect(input).not.toHaveProperty('cover_url');
	});
	it('retains uploaded media IDs across a failed save and retry', async () => {
		const topic = emptyKotobaAdminTopic(1);
		topic.cover = { url: '', file: new File(['png'], 'cover.png', { type: 'image/png' }) };
		const upload = vi.fn(async () => ({
			id: record.cover_media_id!,
			kind: 'cover' as const,
			url: record.cover_url,
			mime_type: 'image/png',
			size_bytes: 3
		}));
		const save = vi
			.fn()
			.mockRejectedValueOnce(new KotobaError(500, 'failed'))
			.mockResolvedValue(record);
		const repository = { upload, save } as unknown as KotobaRepository;
		await expect(saveKotobaAdminTopic(repository, topic)).rejects.toThrow('failed');
		expect(topic.cover.mediaId).toBe(record.cover_media_id);
		await saveKotobaAdminTopic(repository, topic);
		expect(upload).toHaveBeenCalledTimes(1);
		expect(save.mock.calls[1][1].cover_media_id).toBe(record.cover_media_id);
	});
	it('maps index errors after reorder and renews URLs without overwriting unsaved text/version', () => {
		const topic = kotobaAdminTopic(record);
		topic.title = 'Unsaved';
		const errors = kotobaAdminFieldErrors(
			new KotobaError(400, 'invalid', {
				'vocabulary.0.example.japanese': 'required',
				cover_media_id: 'missing'
			}),
			topic
		);
		expect(errors[`${topic.vocabulary[0].id}.japanese`]).toBe('required');
		expect(errors.cover).toBe('missing');
		refreshKotobaAdminMedia(
			topic,
			kotobaAdminTopic({
				...record,
				title: 'Server changed',
				version: 8,
				cover_url: 'https://storage.test/cover?token=new'
			})
		);
		expect(topic.title).toBe('Unsaved');
		expect(topic.version).toBe(3);
		expect(topic.cover!.url).toContain('token=new');
	});
});
