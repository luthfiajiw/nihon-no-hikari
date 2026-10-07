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

	it('starts an attempt with an empty body', async () => {
		const responseData = {
			success: true,
			message: 'Attempt dimulai.',
			data: {
				id: 'attempt-1',
				number: 1,
				status: 'in_progress',
				startedAt: '2026-10-07T12:00:00.000Z',
				question_set: {
					id: 'set-1',
					title: 'Hiragana',
					kind: 'practice',
					passing_score: 80,
					question_count: 0,
					cooldown_minutes: 0,
					shuffle_questions: false,
					is_passed: false,
					attempts_used: 1
				},
				questions: []
			}
		};
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(responseData), {
				status: 201,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		const source = new QuestionSource(
			new HttpClient({ fetch: mockFetch, baseUrl: 'http://localhost:8080/api' })
		);

		await expect(source.startAttempt('course/1', 'lesson/1', 'set/1')).resolves.toEqual(
			responseData
		);
		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/v1/courses/course%2F1/lessons/lesson%2F1/question-sets/set%2F1/attempts',
			{
				method: 'POST',
				headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
				body: '{}'
			}
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

	it('submits an attempt with the answers body', async () => {
		const request = {
			answers: [
				{
					question_id: 'question/1',
					selected_option_id: 'option-1',
					stroke_input: null
				}
			]
		};
		const responseData = {
			success: true,
			message: 'Jawaban berhasil dikirim.',
			data: {
				attempt_id: 'attempt-1',
				score: 100,
				earned_points: 10,
				total_points: 10,
				passing_score: 80,
				is_passed: true,
				lesson_status: 'completed',
				submitted_at: '2026-10-07T12:00:00.000Z',
				skills: [],
				answers: []
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

		await expect(
			source.submitAttempt('course/1', 'lesson/1', 'set/1', 'attempt/1', request)
		).resolves.toEqual(responseData);
		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8080/api/v1/courses/course%2F1/lessons/lesson%2F1/question-sets/set%2F1/attempts/attempt%2F1/submit',
			{
				method: 'POST',
				headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
				body: JSON.stringify(request)
			}
		);
	});
});
