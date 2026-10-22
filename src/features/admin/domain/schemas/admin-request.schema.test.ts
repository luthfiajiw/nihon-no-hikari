import { describe, expect, it } from 'vitest';
import { adminContentSchemas, questionSetContentSchema } from './admin-request.schema';
import { parseRequest as parseAdminRequest } from '$lib/server/validation';

const parent = '11111111-1111-4111-8111-111111111111';
const core = { title: 'Hiragana あ', slug: 'hiragana', order_index: 0 };
const practice = {
	title: 'Latihan',
	kind: 'practice',
	skill: 'reading',
	lesson_id: parent,
	module_id: null,
	passing_score: 80
};

describe('admin mutation schemas', () => {
	it.each([
		['course', { ...core, level_id: parent }],
		['module', { ...core, course_id: parent, module_prerequisites: [] }],
		['lesson', { ...core, module_id: parent, content: { content: '<p>あ</p>', tips: '' } }],
		['question_set', practice],
		['question_set', { ...practice, kind: 'final_exam', lesson_id: null, module_id: parent }]
	] as const)('accepts a valid %s draft', (kind, input) => {
		expect(parseAdminRequest(adminContentSchemas[kind], input)).toEqual(input);
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
		expect(() => parseAdminRequest(adminContentSchemas.course, input)).toThrow(
			expect.objectContaining({ status: 400 })
		);
	});

	it('matches the backend title limit in UTF-8 bytes', () => {
		expect(() =>
			parseAdminRequest(adminContentSchemas.course, {
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
		expect(parseAdminRequest(adminContentSchemas.lesson, input)).toMatchObject({
			content: { content: '<p>あ</p>', tips: '', audio: 'lesson.mp3' }
		});
		expect(
			parseAdminRequest(adminContentSchemas.lesson, { ...input, content: '<p>legacy</p>' })
		).toMatchObject({
			content: { content: '<p>legacy</p>', tips: '' }
		});
	});

	it('rejects invalid nested lesson fields and duplicate prerequisites', () => {
		expect(() =>
			parseAdminRequest(adminContentSchemas.lesson, {
				...core,
				module_id: parent,
				content: { content: 42 }
			})
		).toThrow();
		expect(() =>
			parseAdminRequest(adminContentSchemas.module, {
				...core,
				course_id: parent,
				module_prerequisites: [parent, parent.toUpperCase()]
			})
		).toThrow('ID prasyarat tidak boleh duplikat.');
	});

	it.each([
		{ ...practice, module_id: parent },
		{ ...practice, lesson_id: null },
		{ ...practice, skill: 'listening' },
		{ ...practice, passing_score: 101 },
		{ ...practice, max_attempts: 0 },
		{ ...practice, time_limit_seconds: -1 },
		{ ...practice, total_questions: 0 }
	])('rejects invalid question set configuration %#', (input) => {
		expect(() => parseAdminRequest(questionSetContentSchema, input)).toThrow();
	});

	it('allows unfinished questions in a draft while removing unrelated record fields', () => {
		const questions = [
			{
				question_type: 'stroke_writing',
				prompt_text: '',
				stroke_template_id: null,
				points: 0,
				options: []
			}
		];
		expect(
			parseAdminRequest(questionSetContentSchema, {
				...practice,
				skill: 'writing',
				questions,
				is_published: true,
				id: 'untrusted-record-id'
			})
		).toEqual({ ...practice, skill: 'writing', questions });
	});
});
