import { HttpClient } from '$lib/http-client';
import type {
	AttemptResponse,
	QuestionSetDetailResponse,
	SubmitAttemptRequest,
	SubmitAttemptResponse
} from '../../domain/entities/question.entity';

type ErrorResponse = { error?: string };

export class QuestionSource {
	constructor(private readonly httpClient: HttpClient) {}

	async getQuestionSetDetail(
		courseId: string,
		lessonId: string,
		questionSetId: string
	): Promise<QuestionSetDetailResponse> {
		const response = await this.httpClient.request<QuestionSetDetailResponse & ErrorResponse>(
			`/v1/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/question-sets/${encodeURIComponent(questionSetId)}`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json'
				}
			}
		);

		if (!response.ok) {
			throw new Error(response.data?.error || 'Gagal mengambil detail set soal.');
		}

		return response.data;
	}

	async startAttempt(
		courseId: string,
		lessonId: string,
		questionSetId: string
	): Promise<AttemptResponse> {
		const response = await this.httpClient.request<AttemptResponse & ErrorResponse>(
			`/v1/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/question-sets/${encodeURIComponent(questionSetId)}/attempts`,
			{
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({})
			}
		);

		if (!response.ok) {
			throw new Error(response.data?.error || 'Gagal memulai pengerjaan soal.');
		}

		return response.data;
	}

	async submitAttempt(
		courseId: string,
		lessonId: string,
		questionSetId: string,
		attemptId: string,
		request: SubmitAttemptRequest
	): Promise<SubmitAttemptResponse> {
		const response = await this.httpClient.request<SubmitAttemptResponse & ErrorResponse>(
			`/v1/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/question-sets/${encodeURIComponent(questionSetId)}/attempts/${encodeURIComponent(attemptId)}/submit`,
			{
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(request)
			}
		);

		if (!response.ok) {
			throw new Error(response.data?.error || 'Gagal mengirim jawaban.');
		}

		return response.data;
	}
}
