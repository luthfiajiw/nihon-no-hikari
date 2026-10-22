import { describe, expect, it, vi } from 'vitest';
import { AdminSource } from './admin.source';

function sourceWith(response: Response) {
	const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(response);
	return {
		source: new AdminSource(fetch),
		fetch
	};
}
describe('admin source transport', () => {
	it('uses dedicated template endpoints and unwraps saved details', async () => {
		const detail = { id: 'kana', character: 'あ', stroke_count: 3 };
		const { source, fetch } = sourceWith(Response.json({ data: detail }));
		const input = {
			script: 'hiragana' as const,
			character: 'あ',
			romaji: 'a',
			source_version: 'test'
		};
		await expect(source.saveTemplate('kana/1', input)).resolves.toEqual(detail);
		expect(fetch).toHaveBeenLastCalledWith(
			'/api/v1/admin/templates/kana%2F1',
			expect.objectContaining({ method: 'PATCH', body: JSON.stringify(input) })
		);
	});
	it('sends SVG to the preview endpoint without saving a template', async () => {
		const { source, fetch } = sourceWith(Response.json({ data: { stroke_count: 1 } }));
		const input = {
			script: 'katakana' as const,
			character: 'カ',
			romaji: 'ka',
			source_version: 'test',
			svg_content: '<svg />'
		};
		await source.previewTemplate(input);
		expect(fetch).toHaveBeenCalledExactlyOnceWith(
			'/api/v1/admin/templates/preview',
			expect.objectContaining({ method: 'POST', body: JSON.stringify(input) })
		);
	});
	it('sends the order-only contract without saving or publishing material', async () => {
		const { source, fetch } = sourceWith(Response.json({ success: true }));
		const input = {
			parent_id: '11111111-1111-4111-8111-111111111111',
			ordered_ids: ['22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333']
		};
		await source.reorderContent('lesson', input);
		expect(fetch).toHaveBeenCalledExactlyOnceWith(
			'/api/v1/admin/content/lesson/reorder',
			expect.objectContaining({ method: 'POST', body: JSON.stringify(input) })
		);
	});
	it('preserves the status when an error response is not JSON', async () => {
		const { source } = sourceWith(new Response('Bad gateway', { status: 502 }));
		await expect(source.getUsers()).rejects.toMatchObject({
			status: 502,
			message: 'Operasi admin gagal. Silakan coba lagi.'
		});
	});
	it('encodes selected course ids and unwraps the data envelope', async () => {
		const catalog = { courses: [], modules: [], lessons: [], question_sets: [] };
		const { source, fetch } = sourceWith(Response.json({ data: catalog }));
		await expect(source.getCatalog('course/1')).resolves.toEqual(catalog);
		expect(fetch).toHaveBeenCalledWith(
			'/api/v1/admin/catalog?course_id=course%2F1',
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
		const source = new AdminSource(fetch);
		await expect(source.getUsers()).rejects.toMatchObject({
			status: 502,
			message: 'Gagal terhubung ke server.'
		});
	});
});
