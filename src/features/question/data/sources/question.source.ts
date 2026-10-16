import type {
	AttemptResponse,
	QuestionSetDetailResponse,
	SubmitAttemptRequest,
	SubmitAttemptResponse
} from '../../domain/entities/question.entity';

type ErrorResponse = { error?: string; message?: string };

export class QuestionSource {
	constructor(private readonly fetcher: typeof fetch) {}

	async getQuestionSetDetail(questionSetId: string): Promise<QuestionSetDetailResponse> {
		const response = await this.fetcher(
			`/api/v1/question-sets/${encodeURIComponent(questionSetId)}`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json'
				}
			}
		);
		const data = (await response.json().catch(() => ({}))) as QuestionSetDetailResponse &
			ErrorResponse;

		if (!response.ok) {
			throw new Error(data?.error || data?.message || 'Gagal mengambil detail set soal.');
		}

		return data;
	}

	async startAttempt(questionSetId: string): Promise<AttemptResponse> {
		const response = await this.fetcher(
			`/api/v1/question-sets/${encodeURIComponent(questionSetId)}/attempts`,
			{
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({})
			}
		);
		const data = (await response.json().catch(() => ({}))) as AttemptResponse & ErrorResponse;

		if (!response.ok) {
			throw new Error(data?.error || data?.message || 'Gagal memulai pengerjaan soal.');
		}

		return data;
	}

	async submitAttempt(
		questionSetId: string,
		attemptId: string,
		request: SubmitAttemptRequest
	): Promise<SubmitAttemptResponse> {
		const response = await this.fetcher(
			`/api/v1/question-sets/${encodeURIComponent(questionSetId)}/attempts/${encodeURIComponent(attemptId)}/submit`,
			{
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(request)
			}
		);
		const data = (await response.json().catch(() => ({}))) as SubmitAttemptResponse & ErrorResponse;

		if (!response.ok) {
			throw new Error(data?.error || data?.message || 'Gagal mengirim jawaban.');
		}

		return data;
	}

	async abandonAttempt(questionSetId: string, attemptId: string): Promise<void> {
		const response = await this.fetcher(
			`/api/v1/question-sets/${encodeURIComponent(questionSetId)}/attempts/${encodeURIComponent(attemptId)}/abandon`,
			{
				method: 'POST',
				headers: {
					Accept: 'application/json'
				}
			}
		);
		if (!response.ok) {
			const data = (await response.json().catch(() => ({}))) as ErrorResponse;
			throw new Error(data?.error || data?.message || 'Gagal membatalkan pengerjaan soal.');
		}
	}
}
