import { describe, expect, it } from 'vitest';
import { courseAdminContentSchemas } from './course-admin-request.schema';
import { parseRequest as parseAdminRequest } from '$lib/server/validation';

const parent = '11111111-1111-4111-8111-111111111111';
const core = { title: 'Hiragana あ', slug: 'hiragana', order_index: 0 };

describe('admin mutation schemas', () => {
	it.each([
		['course', { ...core, level_id: parent }],
		['module', { ...core, course_id: parent, module_prerequisites: [] }],
		['lesson', { ...core, module_id: parent, content: { content: '<p>あ</p>', tips: '' } }]
	] as const)('accepts a valid %s draft', (kind, input) => {
		expect(parseAdminRequest(courseAdminContentSchemas[kind], input)).toEqual(input);
	});

	it.each([
		{ ...core, level_id: 'invalid' },
		{ ...core, level_id: parent, title: ' ' },
		{ ...core, level_id: parent, slug: 'Invalid Slug' },
		{ ...core, level_id: parent, order_index: -1 },
		{ ...core, level_id: parent, order_index: 1.5 },
		{ ...core, level_id: parent, order_index: 32768 },
		{ ...core, level_id: parent, thumbnail_url: 'javascript:alert(1)' }
	])('rejects invalid course fields %# with a 400 error', (input) => {
		expect(() => parseAdminRequest(courseAdminContentSchemas.course, input)).toThrow(
			expect.objectContaining({ status: 400 })
		);
	});

	it('matches the backend title limit in UTF-8 bytes', () => {
		expect(() =>
			parseAdminRequest(courseAdminContentSchemas.course, {
				...core,
				level_id: parent,
				title: 'あ'.repeat(54)
			})
		).toThrow('Judul maksimal 160 byte.');
	});

	it('preserves additional lesson metadata and normalizes legacy content', () => {
		const input = {
			...core,
			module_id: parent,
			content: { content: '<p>あ</p>', audio: 'lesson.mp3' }
		};
		expect(parseAdminRequest(courseAdminContentSchemas.lesson, input)).toMatchObject({
			content: { content: '<p>あ</p>', tips: '', audio: 'lesson.mp3' }
		});
		expect(
			parseAdminRequest(courseAdminContentSchemas.lesson, { ...input, content: '<p>legacy</p>' })
		).toMatchObject({
			content: { content: '<p>legacy</p>', tips: '' }
		});
	});

	it('rejects invalid nested lesson fields and duplicate prerequisites', () => {
		expect(() =>
			parseAdminRequest(courseAdminContentSchemas.lesson, {
				...core,
				module_id: parent,
				content: { content: 42 }
			})
		).toThrow();
		expect(() =>
			parseAdminRequest(courseAdminContentSchemas.module, {
				...core,
				course_id: parent,
				module_prerequisites: [parent, parent.toUpperCase()]
			})
		).toThrow('ID prasyarat tidak boleh duplikat.');
	});
});
