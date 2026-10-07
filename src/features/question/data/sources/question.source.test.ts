import { describe, expect, it, vi } from 'vitest';
import { HttpClient } from '$lib/http-client';
import { QuestionSource } from './question.source';

describe('QuestionSource', () => {
	it('gets a question set detail from the nested course endpoint', async () => {
		const responseData = {
			success: true,
			message: 'OK',
			data: {
				id: 'set-1',
				title: 'Hiragana',
				kind: 'practice',
				passing_score: 80,
				question_count: 1,
				cooldown_minutes: 0,
				shuffle_questions: false,
				is_passed: false,
				attempts_used: 0,
				questions: []
			}
		};
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(responseData), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		const source = new QuestionSource(
			new HttpClient({ fetch: mockFetch, baseUrl: 'http://localhost:8080/api' })
		);

		await expect(source.getQuestionSetDetail('course/1', 'lesson/1', 'set/1')).resolves.toEqual(
			responseData
		);
		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/v1/courses/course%2F1/lessons/lesson%2F1/question-sets/set%2F1',
			{ method: 'GET', headers: { Accept: 'application/json' } }
		);
	});

	it('throws the API message when the request fails', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ success: false, message: 'Set soal tidak ditemukan.' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		const source = new QuestionSource(new HttpClient({ fetch: mockFetch, baseUrl: '' }));

		await expect(source.getQuestionSetDetail('course-1', 'lesson-1', 'missing')).rejects.toThrow(
			'Set soal tidak ditemukan.'
		);
	});
});
