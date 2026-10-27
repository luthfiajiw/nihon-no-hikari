import { describe, expect, it } from 'vitest';
import { questionAdminSetContentSchema } from './question-admin-request.schema';
import { parseRequest as parseAdminRequest } from '$lib/server/validation';
const parent = '11111111-1111-4111-8111-111111111111';
const practice = {
	title: 'Latihan',
	kind: 'practice',
	skill: 'reading',
	lesson_id: parent,
	module_id: null,
	passing_score: 80
};
describe('question set schemas', () => {
	it.each([practice, { ...practice, kind: 'final_exam', lesson_id: null, module_id: parent }])(
		'accepts valid assessment parents',
		(input) => {
			expect(parseAdminRequest(questionAdminSetContentSchema, input)).toEqual(input);
		}
	);
	it.each([
		{ ...practice, module_id: parent },
		{ ...practice, lesson_id: null },
		{ ...practice, skill: 'listening' },
		{ ...practice, passing_score: 101 },
		{ ...practice, max_attempts: 0 },
		{ ...practice, time_limit_seconds: -1 },
		{ ...practice, total_questions: 0 }
	])('rejects invalid question set configuration %#', (input) => {
		expect(() => parseAdminRequest(questionAdminSetContentSchema, input)).toThrow();
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
			parseAdminRequest(questionAdminSetContentSchema, {
				...practice,
				skill: 'writing',
				questions,
				is_published: true,
				id: 'untrusted-record-id'
			})
		).toEqual({ ...practice, skill: 'writing', questions });
	});
});
