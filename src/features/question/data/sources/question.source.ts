import { requestJson } from '$lib/http/request-json';
import type {
	QuestionAdminRecord,
	QuestionAdminContentRecord,
	QuestionAdminContentDetail,
	QuestionAdminMutationResult
} from '../../domain/entities/question-admin.entity';
import type {
	QuestionKanaTemplateMetadata,
	QuestionKanaTemplateDetail,
	QuestionKanaTemplateInput,
	QuestionKanaTemplatePreview
} from '../../domain/entities/question-kana-template.entity';
type ApiPayload<T> = { data: T; error?: string; message?: string };
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
	private adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
		return requestJson<T>(this.fetcher, `/api/v1/admin${path}`, options);
	}

	private contentPath(id?: string): string {
		return `/question-sets${id ? `/${encodeURIComponent(id)}` : ''}`;
	}

	async getAdminContentList(): Promise<QuestionAdminRecord[]> {
		return (await this.adminRequest<ApiPayload<QuestionAdminRecord[]>>(this.contentPath())).data;
	}

	getAdminContent(id: string): Promise<QuestionAdminContentDetail> {
		return this.adminRequest(this.contentPath(id));
	}

	saveAdminContent(
		id: string | null,
		payload: QuestionAdminContentRecord
	): Promise<QuestionAdminMutationResult> {
		return this.adminRequest(this.contentPath(id ?? undefined), {
			method: id ? 'PATCH' : 'POST',
			body: JSON.stringify(payload)
		});
	}

	publishAdminContent(id: string): Promise<QuestionAdminMutationResult> {
		return this.adminRequest(`${this.contentPath(id)}/publish`, { method: 'POST' });
	}

	async removeAdminContent(id: string): Promise<void> {
		await this.adminRequest(this.contentPath(id), { method: 'DELETE' });
	}

	async restoreAdminContent(id: string): Promise<void> {
		await this.adminRequest(`${this.contentPath(id)}/restore`, { method: 'POST' });
	}

	async getAdminTemplates(): Promise<QuestionKanaTemplateMetadata[]> {
		return (await this.adminRequest<ApiPayload<QuestionKanaTemplateMetadata[]>>('/templates')).data;
	}

	async getAdminTemplate(id: string): Promise<QuestionKanaTemplateDetail> {
		return (
			await this.adminRequest<ApiPayload<QuestionKanaTemplateDetail>>(
				`/templates/${encodeURIComponent(id)}`
			)
		).data;
	}

	async previewAdminTemplate(
		input: QuestionKanaTemplateInput
	): Promise<QuestionKanaTemplatePreview> {
		return (
			await this.adminRequest<ApiPayload<QuestionKanaTemplatePreview>>('/templates/preview', {
				method: 'POST',
				body: JSON.stringify(input)
			})
		).data;
	}

	async saveAdminTemplate(
		id: string | null,
		input: QuestionKanaTemplateInput
	): Promise<QuestionKanaTemplateDetail> {
		return (
			await this.adminRequest<ApiPayload<QuestionKanaTemplateDetail>>(
				`/templates${id ? `/${encodeURIComponent(id)}` : ''}`,
				{
					method: id ? 'PATCH' : 'POST',
					body: JSON.stringify(input)
				}
			)
		).data;
	}
}
