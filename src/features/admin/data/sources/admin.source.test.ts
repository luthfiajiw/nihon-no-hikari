import { describe, expect, it, vi } from 'vitest';
import { HttpClient } from '$lib/http-client';
import { AdminSource } from './admin.source';

function sourceWith(response: Response) {
	const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(response);
	return {
		source: new AdminSource(new HttpClient({ baseUrl: 'https://api.example.test', fetch })),
		fetch
	};
}
describe('admin source transport', () => {
	it('encodes selected course ids and unwraps the data envelope', async () => {
		const catalog = { courses: [], modules: [], lessons: [], question_sets: [] };
		const { source, fetch } = sourceWith(Response.json({ data: catalog }));
		await expect(source.getCatalog('course/1')).resolves.toEqual(catalog);
		expect(fetch).toHaveBeenCalledWith(
			'https://api.example.test/v1/admin/catalog?course_id=course%2F1',
			expect.objectContaining({ headers: expect.objectContaining({ Accept: 'application/json' }) })
		);
	});
	it('preserves API error status and message for the presentation adapter', async () => {
		const { source } = sourceWith(
			Response.json({ error: 'Konten sudah dipakai.' }, { status: 409 })
		);
		await expect(source.removeContent('lesson', 'used')).rejects.toMatchObject({
			status: 409,
			message: 'Konten sudah dipakai.'
		});
	});
	it.each([401, 403])('preserves access failure %s', async (status) => {
		const { source } = sourceWith(Response.json({ error: 'Akses tidak diizinkan.' }, { status }));
		await expect(source.checkAccess()).rejects.toMatchObject({ status });
	});
	it('allows an empty successful delete response', async () => {
		const { source } = sourceWith(new Response(null, { status: 204 }));
		await expect(source.removeContent('course', 'course')).resolves.toBeUndefined();
	});
	it('reports connection failures without exposing transport details', async () => {
		const fetch = vi
			.fn<typeof globalThis.fetch>()
			.mockRejectedValue(new Error('connection refused'));
		const source = new AdminSource(new HttpClient({ baseUrl: 'https://api.example.test', fetch }));
		await expect(source.getUsers()).rejects.toMatchObject({
			status: 502,
			message: 'Gagal terhubung ke server.'
		});
	});
});
