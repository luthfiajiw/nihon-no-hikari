import { describe, expect, it, vi } from 'vitest';
import { QuestionSource } from './question.source';

function sourceWith(response: Response) {
	const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(response);
	return {
		source: new QuestionSource(fetch),
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
	run: (source: QuestionSource) => Promise<unknown>;
}[] = [
	{
		name: 'list',
		method: 'GET',
		suffix: '',
		response: { data: [{ id: contentId, title: 'Live' }] },
		expected: [{ id: contentId, title: 'Live' }],
		run: (source) => source.getAdminContentList()
	},
	{
		name: 'create',
		method: 'POST',
		suffix: '',
		body: contentPayload,
		response: { id: 'created' },
		expected: { id: 'created' },
		run: (source) => source.saveAdminContent(null, contentPayload)
	},
	{
		name: 'detail',
		method: 'GET',
		suffix: `/${encodedContentId}`,
		response: contentDetail,
		expected: contentDetail,
		run: (source) => source.getAdminContent(contentId)
	},
	{
		name: 'update',
		method: 'PATCH',
		suffix: `/${encodedContentId}`,
		body: contentPayload,
		response: { id: contentId },
		expected: { id: contentId },
		run: (source) => source.saveAdminContent(contentId, contentPayload)
	},
	{
		name: 'remove',
		method: 'DELETE',
		suffix: `/${encodedContentId}`,
		run: (source) => source.removeAdminContent(contentId)
	},
	{
		name: 'publish',
		method: 'POST',
		suffix: `/${encodedContentId}/publish`,
		response: { id: 'published-version' },
		expected: { id: 'published-version' },
		run: (source) => source.publishAdminContent(contentId)
	},
	{
		name: 'restore',
		method: 'POST',
		suffix: `/${encodedContentId}/restore`,
		run: (source) => source.restoreAdminContent(contentId)
	}
];

describe('admin question-set resource contract', () => {
	const resource = 'question-sets';
	it.each(contentOperations)(
		'$name uses the resource URL and preserves the contract',
		async (operation) => {
			const { source, fetch } = sourceWith(
				operation.response === undefined
					? new Response(null, { status: 204 })
					: Response.json(operation.response)
			);
			await expect(operation.run(source)).resolves.toEqual(operation.expected);
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

describe('question administrative transport', () => {
	it('uses dedicated template endpoints and unwraps saved details', async () => {
		const detail = { id: 'kana', character: 'あ', stroke_count: 3 };
		const { source, fetch } = sourceWith(Response.json({ data: detail }));
		const input = {
			script: 'hiragana' as const,
			character: 'あ',
			romaji: 'a',
			source_version: 'test'
		};
		await expect(source.saveAdminTemplate('kana/1', input)).resolves.toEqual(detail);
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
		await source.previewAdminTemplate(input);
		expect(fetch).toHaveBeenCalledExactlyOnceWith(
			'/api/v1/admin/templates/preview',
			expect.objectContaining({ method: 'POST', body: JSON.stringify(input) })
		);
	});
});
