import { describe, expect, it } from 'vitest';
import { validateApiRequestBody } from './api-request-validation';

const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
function validate(method: string, path: string, input: unknown) {
	return validateApiRequestBody(
		method,
		path,
		new TextEncoder().encode(JSON.stringify(input)).buffer
	);
}

describe('server request validation', () => {
	it.each(['locked', 'invalid', 42, null, undefined])(
		'rejects invalid lesson status %#',
		(status) => {
			expect(() => validate('PUT', '/api/v1/lessons/lesson/progress', { status })).toThrow();
		}
	);
	it('rejects the unlocked status for module updates', () => {
		expect(() =>
			validate('PUT', '/api/v1/courses/course/modules/module/progress', { status: 'unlocked' })
		).toThrow();
	});
	it.each([
		null,
		[],
		{},
		{ parent_id: 'invalid', ordered_ids: [id] },
		{ parent_id: id, ordered_ids: [id, id.toUpperCase()] },
		{ parent_id: id, ordered_ids: ['00000000-0000-0000-0000-000000000000'] },
		{ parent_id: id, ordered_ids: Array(32769).fill(id) }
	])('rejects invalid reorder input %#', (input) => {
		for (const path of ['/api/v1/admin/modules/reorder', '/api/v1/admin/lessons/reorder'])
			expect(() => validate('POST', path, input)).toThrow();
	});
	it('normalizes kana metadata before forwarding a PATCH body', () => {
		const result = validate('PATCH', '/api/v1/admin/templates/template', {
			script: 'hiragana',
			character: 'か\u3099',
			romaji: ' ga ',
			source_version: ' test '
		});
		expect(JSON.parse(new TextDecoder().decode(result))).toEqual({
			script: 'hiragana',
			character: 'が',
			romaji: 'ga',
			source_version: 'test'
		});
	});
	it('normalizes legacy lesson content while preserving extra lesson metadata', () => {
		const result = validate('POST', '/api/v1/admin/lessons', {
			title: 'Hiragana',
			slug: 'hiragana',
			module_id: id,
			content: { content: '<p>あ</p>', audio: 'lesson.mp3' }
		});
		expect(JSON.parse(new TextDecoder().decode(result))).toMatchObject({
			content: { content: '<p>あ</p>', tips: '', audio: 'lesson.mp3' }
		});
	});
	it.each([
		['modules', { parent_id: id, ordered_ids: [] }],
		['lessons', { parent_id: id, ordered_ids: [id] }]
	])('validates the %s reorder body before matching content details', (resource, input) => {
		const result = validate('POST', `/api/v1/admin/${resource}/reorder`, input);
		expect(JSON.parse(new TextDecoder().decode(result))).toEqual(input);
	});
	it('validates lesson preview before matching a lesson detail', () => {
		const path = '/api/v1/admin/lessons/preview';
		expect(() => validate('POST', path, { content: { content: 42 } })).toThrow();
		const result = validate('POST', path, { content: { content: '<p>あ</p>', audio: 'a.mp3' } });
		expect(JSON.parse(new TextDecoder().decode(result))).toEqual({
			content: { content: '<p>あ</p>', tips: '', audio: 'a.mp3' }
		});
	});
});

describe.each([
	['courses', { title: 'N5', slug: 'n5', level_id: id, description: null, thumbnail_url: '' }],
	[
		'modules',
		{
			title: 'Kana',
			slug: 'kana',
			course_id: id,
			module_prerequisites: [],
			estimated_minutes: null
		}
	],
	[
		'lessons',
		{
			title: 'Hiragana',
			slug: 'hiragana',
			module_id: id,
			lesson_prerequisites: null,
			content: { content: '<p>あ</p>', tips: '', audio: 'a.mp3' }
		}
	],
	[
		'question-sets',
		{
			title: 'Writing',
			kind: 'practice',
			skill: 'writing',
			lesson_id: id,
			module_id: null,
			passing_score: 80,
			questions: [],
			total_questions: null
		}
	]
] as const)('admin %s payload validation', (resource, input) => {
	it.each(['POST', 'PATCH'])(
		'preserves full valid %s payloads and rejects incomplete payloads',
		(method) => {
			const path = `/api/v1/admin/${resource}${method === 'PATCH' ? '/item' : ''}`;
			const result = validate(method, path, input);
			expect(JSON.parse(new TextDecoder().decode(result))).toEqual(input);
			expect(() => validate(method, path, {})).toThrow();
		}
	);
});
