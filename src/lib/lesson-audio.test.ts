import { describe, expect, it } from 'vitest';
import { resolveLessonAudioUrl } from './lesson-audio';

describe('resolveLessonAudioUrl', () => {
	it('builds an mp3 URL from an audio key', () => {
		expect(resolveLessonAudioUrl('ai', 'https://example.supabase.co/audio/hiragana/')).toBe(
			'https://example.supabase.co/audio/hiragana/ai.mp3'
		);
	});

	it('keeps an existing file extension and nested path', () => {
		expect(resolveLessonAudioUrl('hiragana/ao.mp3', 'https://example.com/nnh')).toBe(
			'https://example.com/nnh/hiragana/ao.mp3'
		);
	});

	it('encodes path segments', () => {
		expect(resolveLessonAudioUrl('huruf あ', 'https://example.com/audio')).toBe(
			'https://example.com/audio/huruf%20%E3%81%82.mp3'
		);
	});

	it('rejects empty values and path traversal', () => {
		expect(resolveLessonAudioUrl('', 'https://example.com/audio')).toBeNull();
		expect(resolveLessonAudioUrl('../secret', 'https://example.com/audio')).toBeNull();
	});
});
