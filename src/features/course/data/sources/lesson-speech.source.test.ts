import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('#request-fetch', () => ({
	requestFetch: (...args: Parameters<typeof fetch>) => globalThis.fetch(...args)
}));
import { getLessonSpeechToken } from './lesson-speech.source';

afterEach(() => vi.unstubAllGlobals());
describe('lesson speech token source', () => {
	it('uses the authenticated same-origin proxy without persisting token responses', async () => {
		const token = {
			token: 'temporary',
			region: 'southeastasia',
			expires_at: new Date().toISOString()
		};
		const fetch = vi.fn().mockResolvedValue(Response.json({ success: true, data: token }));
		vi.stubGlobal('fetch', fetch);
		const signal = new AbortController().signal;
		await expect(getLessonSpeechToken('lesson/id', signal)).resolves.toEqual(token);
		expect(fetch).toHaveBeenCalledWith('/api/v1/lessons/lesson%2Fid/speech-token', {
			method: 'POST',
			cache: 'no-store',
			headers: { Accept: 'application/json' },
			signal
		});
	});
	it.each([503, 429, 502, 504])('surfaces a useful error for status %s', async (status) => {
		vi.stubGlobal(
			'fetch',
			vi
				.fn()
				.mockResolvedValue(
					Response.json({ success: false, error: 'Coba lagi sebentar.' }, { status })
				)
		);
		await expect(getLessonSpeechToken('id', new AbortController().signal)).rejects.toThrow(
			'Coba lagi sebentar.'
		);
	});
});
