import { HttpClient } from '$lib/http-client';
import type { QuestionSetDetailResponse } from '../../domain/entities/question.entity';

export class QuestionSource {
	constructor(private readonly httpClient: HttpClient) {}

	async getQuestionSetDetail(
		courseId: string,
		lessonId: string,
		questionSetId: string
	): Promise<QuestionSetDetailResponse> {
		const response = await this.httpClient.request<QuestionSetDetailResponse>(
			`/v1/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/question-sets/${encodeURIComponent(questionSetId)}`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json'
				}
			}
		);

		if (!response.ok) {
			throw new Error(response.data?.message || 'Gagal mengambil detail set soal.');
		}

		return response.data;
	}
}
