import { describe, it, expect } from 'vitest';
import { mediaNeedsRefresh, topicDetail, topicSummary } from './kotoba-api.model';
import type { KotobaTopicRecord } from '../../domain/entities/kotoba-api.entity';

const baseRecord: KotobaTopicRecord = {
	id: '11111111-1111-4111-8111-111111111111',
	title: 'Sekolah',
	level: 'N5',
	category: 'Dasar',
	description: 'Kosakata sekolah',
	order_index: 1,
	cover_url: 'https://storage.test/public/cover.png',
	vocabulary_count: 1,
	exercise_count: 0,
	created_at: '2026-10-26T12:00:00Z',
	updated_at: '2026-10-26T12:00:00Z'
};

describe('mediaNeedsRefresh', () => {
	it('returns false when expiresAt is omitted, null, empty, or invalid (public URLs)', () => {
		expect(mediaNeedsRefresh()).toBe(false);
		expect(mediaNeedsRefresh(undefined)).toBe(false);
		expect(mediaNeedsRefresh(null)).toBe(false);
		expect(mediaNeedsRefresh('')).toBe(false);
		expect(mediaNeedsRefresh('not-a-date')).toBe(false);
	});

	it('returns true when signed URL expires within 60 seconds or is already expired', () => {
		const soon = new Date(Date.now() + 30_000).toISOString();
		const past = new Date(Date.now() - 10_000).toISOString();
		expect(mediaNeedsRefresh(soon)).toBe(true);
		expect(mediaNeedsRefresh(past)).toBe(true);
	});

	it('returns false when signed URL has more than 60 seconds remaining', () => {
		const future = new Date(Date.now() + 120_000).toISOString();
		expect(mediaNeedsRefresh(future)).toBe(false);
	});
});

describe('topicSummary and topicDetail null-safety', () => {
	it('maps omitted or null media_urls_expires_at to undefined without triggering refresh', () => {
		const summary = topicSummary(baseRecord);
		expect(summary.mediaExpiresAt).toBeUndefined();
		expect(mediaNeedsRefresh(summary.mediaExpiresAt)).toBe(false);

		const detail = topicDetail({ ...baseRecord, media_urls_expires_at: null });
		expect(detail.mediaExpiresAt).toBeUndefined();
		expect(mediaNeedsRefresh(detail.mediaExpiresAt)).toBe(false);
	});
});
