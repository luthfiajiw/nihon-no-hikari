import type { RequestEvent } from '@sveltejs/kit';
import { describe, expect, it, vi } from 'vitest';
import { requestFetch } from '#request-fetch';
import { getListCoursesUseCase } from '$dependencies/course.dependency';
import { withRequestEvent } from './request-event.test-utils';

describe('singleton request fetch', () => {
	it('resolves the current fetch after awaits and isolates concurrent users', async () => {
		const run = async (user: string) => {
			const fetch = vi
				.fn<typeof globalThis.fetch>()
				.mockResolvedValue(Response.json({ success: true, message: 'OK', data: [{ id: user }] }));
			const event = { fetch } as unknown as RequestEvent;
			const result = await withRequestEvent(event, async () => {
				await Promise.resolve();
				return getListCoursesUseCase.exec();
			});
			expect(fetch).toHaveBeenCalledWith('/api/v1/courses', expect.any(Object));
			return result.data[0].id;
		};
		expect(await Promise.all([run('first'), run('second')])).toEqual(['first', 'second']);
	});

	it('requires a request context on the server', () => {
		expect(() => requestFetch('/api/v1/courses')).toThrow();
	});
});
