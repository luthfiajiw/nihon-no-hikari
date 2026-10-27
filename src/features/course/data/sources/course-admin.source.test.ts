import { describe, expect, it, vi } from 'vitest';
import { CourseSource } from './course.source';
import type { CourseAdminContentKind } from '../../domain/entities/course-admin.entity';

function sourceWith(response: Response) {
	const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(response);
	return {
		source: new CourseSource(fetch),
		fetch
	};
}
const contentId = 'item/1?draft=1';
const encodedContentId = 'item%2F1%3Fdraft%3D1';
const contentPayload = {
	title: 'Draft',
	description: null,
	module_prerequisites: [],
	content: { content: '<p>あ</p>', tips: '', audio: 'lesson.mp3' }
};
const contentDetail = { data: { id: contentId, title: 'Live' }, draft: contentPayload };
const contentOperations: {
	name: string;
	method: string;
	suffix: string;
	body?: unknown;
	response?: unknown;
	expected?: unknown;
	run: (source: CourseSource, kind: CourseAdminContentKind) => Promise<unknown>;
}[] = [
	{
		name: 'list',
		method: 'GET',
		suffix: '',
		response: { data: [{ id: contentId, title: 'Live' }] },
		expected: [{ id: contentId, title: 'Live' }],
		run: (source, kind) => source.getAdminContentList(kind)
	},
	{
		name: 'create',
		method: 'POST',
		suffix: '',
		body: contentPayload,
		response: { id: 'created' },
		expected: { id: 'created' },
		run: (source, kind) => source.saveAdminContent(kind, null, contentPayload)
	},
	{
		name: 'detail',
		method: 'GET',
		suffix: `/${encodedContentId}`,
		response: contentDetail,
		expected: contentDetail,
		run: (source, kind) => source.getAdminContent(kind, contentId)
	},
	{
		name: 'update',
		method: 'PATCH',
		suffix: `/${encodedContentId}`,
		body: contentPayload,
		response: { id: contentId },
		expected: { id: contentId },
		run: (source, kind) => source.saveAdminContent(kind, contentId, contentPayload)
	},
	{
		name: 'remove',
		method: 'DELETE',
		suffix: `/${encodedContentId}`,
		run: (source, kind) => source.removeAdminContent(kind, contentId)
	},
	{
		name: 'publish',
		method: 'POST',
		suffix: `/${encodedContentId}/publish`,
		response: { id: 'published-version' },
		expected: { id: 'published-version' },
		run: (source, kind) => source.publishAdminContent(kind, contentId)
	},
	{
		name: 'restore',
		method: 'POST',
		suffix: `/${encodedContentId}/restore`,
		run: (source, kind) => source.restoreAdminContent(kind, contentId)
	}
];

describe.each([
	['course', 'courses'],
	['module', 'modules'],
	['lesson', 'lessons']
] as const)('admin %s resource contract', (kind, resource) => {
	it.each(contentOperations)(
		'$name uses the resource URL and preserves the contract',
		async (operation) => {
			const { source, fetch } = sourceWith(
				operation.response === undefined
					? new Response(null, { status: 204 })
					: Response.json(operation.response)
			);
			await expect(operation.run(source, kind)).resolves.toEqual(operation.expected);
			expect(fetch).toHaveBeenCalledExactlyOnceWith(
				`/api/v1/admin/${resource}${operation.suffix}`,
				expect.objectContaining({
					headers: expect.objectContaining({ Accept: 'application/json' })
				})
			);
			expect(fetch.mock.calls[0][1]?.method ?? 'GET').toBe(operation.method);
			expect(fetch.mock.calls[0][1]?.body).toBe(
				operation.body === undefined ? undefined : JSON.stringify(operation.body)
			);
		}
	);
});

describe('course administrative transport', () => {
	it.each([
		['module', '/api/v1/admin/modules/reorder'],
		['lesson', '/api/v1/admin/lessons/reorder']
	] as const)(
		'sends the order-only %s contract without saving or publishing material',
		async (kind, path) => {
			const { source, fetch } = sourceWith(Response.json({ success: true }));
			const input = {
				parent_id: '11111111-1111-4111-8111-111111111111',
				ordered_ids: [
					'22222222-2222-4222-8222-222222222222',
					'33333333-3333-4333-8333-333333333333'
				]
			};
			await source.reorderAdminContent(kind, input);
			expect(fetch).toHaveBeenCalledExactlyOnceWith(
				path,
				expect.objectContaining({ method: 'POST', body: JSON.stringify(input) })
			);
		}
	);
	it('previews lesson content through the lessons resource and unwraps sanitized HTML', async () => {
		const input = { content: '<script>unsafe</script><p>あ</p>', tips: '', audio: 'lesson.mp3' };
		const sanitized = { ...input, content: '<p>あ</p>' };
		const { source, fetch } = sourceWith(Response.json({ data: sanitized }));
		await expect(source.previewAdminLesson(input)).resolves.toEqual(sanitized);
		expect(fetch).toHaveBeenCalledExactlyOnceWith(
			'/api/v1/admin/lessons/preview',
			expect.objectContaining({ method: 'POST', body: JSON.stringify({ content: input }) })
		);
	});
	it('encodes selected course ids and unwraps the data envelope', async () => {
		const catalog = { courses: [], modules: [], lessons: [], question_sets: [] };
		const { source, fetch } = sourceWith(Response.json({ data: catalog }));
		await expect(source.getAdminCatalog('course/1')).resolves.toEqual(catalog);
		expect(fetch).toHaveBeenCalledWith(
			'/api/v1/admin/catalog?course_id=course%2F1',
			expect.objectContaining({ headers: expect.objectContaining({ Accept: 'application/json' }) })
		);
	});
	it('preserves API error status and message for the presentation adapter', async () => {
		const { source } = sourceWith(
			Response.json({ error: 'Konten sudah dipakai.' }, { status: 409 })
		);
		await expect(source.removeAdminContent('lesson', 'used')).rejects.toMatchObject({
			status: 409,
			message: 'Konten sudah dipakai.'
		});
	});
	it('allows an empty successful delete response', async () => {
		const { source } = sourceWith(new Response(null, { status: 204 }));
		await expect(source.removeAdminContent('course', 'course')).resolves.toBeUndefined();
	});
});
