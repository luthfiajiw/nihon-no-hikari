import { describe, expect, it } from 'vitest';
import { validateApiRequestBody } from '$lib/server/api-request-validation';

function validate(input: unknown) {
	return validateApiRequestBody(
		'POST',
		'/api/v1/question-sets/set/attempts/attempt/submit',
		new TextEncoder().encode(JSON.stringify(input)).buffer
	);
}

const question = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const option = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const point = { x: 20, y: 30 };
const choice = { question_id: question, selected_option_id: option, stroke_input: null };

describe('attempt submission validation', () => {
	it.each([
		{ answers: null },
		{ answers: [{ ...choice, question_id: 'invalid' }] },
		{ answers: [{ ...choice, selected_option_id: '00000000-0000-0000-0000-000000000000' }] },
		{ answers: [choice, { ...choice, question_id: question.toUpperCase() }] },
		{ answers: [{ ...choice, stroke_input: [[point]] }] },
		{ answers: [{ ...choice, selected_option_id: null, stroke_input: [[{ x: '20', y: 30 }]] }] },
		{
			answers: [{ ...choice, selected_option_id: null, stroke_input: [[{ x: Infinity, y: 30 }]] }]
		},
		{ answers: [{ ...choice, selected_option_id: null, stroke_input: [[{ x: NaN, y: 30 }]] }] },
		{ answers: [{ ...choice, selected_option_id: null, stroke_input: { strokes: [] } }] },
		{ answers: [{ ...choice, selected_option_id: null, stroke_input: [Array(5000).fill(point)] }] }
	])('rejects malformed answers %# at the server boundary', (input) => {
		expect(() => validate(input)).toThrow();
	});

	it.each([
		{ answers: [] },
		{ answers: [choice] },
		{ answers: [{ ...choice, selected_option_id: null }] },
		{
			answers: [{ ...choice, selected_option_id: null, stroke_input: [[point, { x: 22, y: 31 }]] }]
		}
	])('allows empty, skipped, choice and writing answers %#', ({ answers }) => {
		expect(JSON.parse(new TextDecoder().decode(validate({ answers })))).toEqual({ answers });
	});
});
