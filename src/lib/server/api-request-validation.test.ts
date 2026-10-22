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
		expect(() => validate('POST', '/api/v1/admin/content/module/reorder', input)).toThrow();
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
		const result = validate('POST', '/api/v1/admin/content/lesson', {
			title: 'Hiragana',
			slug: 'hiragana',
			module_id: id,
			content: { content: '<p>あ</p>', audio: 'lesson.mp3' }
		});
		expect(JSON.parse(new TextDecoder().decode(result))).toMatchObject({
			content: { content: '<p>あ</p>', tips: '', audio: 'lesson.mp3' }
		});
	});
});
