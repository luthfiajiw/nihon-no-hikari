import type { QuestionAdminRepository } from '../../domain/repositories/question-admin.repository';
import type { PaginatedResult, PaginationQueryOptions } from '$lib/models/pagination.model';
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
import type {
	AttemptResponse,
	QuestionSetDetailResponse,
	SubmitAttemptRequest,
	SubmitAttemptResponse
} from '../../domain/entities/question.entity';
import type { QuestionRepository } from '../../domain/repositories/question.repository';
import { QuestionSource } from '../sources/question.source';

export class QuestionRepositoryImpl implements QuestionRepository, QuestionAdminRepository {
	constructor(private readonly questionSource: QuestionSource) {}

	getQuestionSetDetail(questionSetId: string): Promise<QuestionSetDetailResponse> {
		return this.questionSource.getQuestionSetDetail(questionSetId);
	}

	startAttempt(questionSetId: string): Promise<AttemptResponse> {
		return this.questionSource.startAttempt(questionSetId);
	}

	submitAttempt(
		questionSetId: string,
		attemptId: string,
		request: SubmitAttemptRequest
	): Promise<SubmitAttemptResponse> {
		return this.questionSource.submitAttempt(questionSetId, attemptId, request);
	}

	abandonAttempt(questionSetId: string, attemptId: string): Promise<void> {
		return this.questionSource.abandonAttempt(questionSetId, attemptId);
	}
	getAdminContentList(
		options?: PaginationQueryOptions & { skill?: string; status?: string }
	): Promise<PaginatedResult<QuestionAdminRecord>> {
		return this.questionSource.getAdminContentList(options);
	}
	getAdminContent(id: string): Promise<QuestionAdminContentDetail> {
		return this.questionSource.getAdminContent(id);
	}
	saveAdminContent(
		id: string | null,
		payload: QuestionAdminContentRecord
	): Promise<QuestionAdminMutationResult> {
		return this.questionSource.saveAdminContent(id, payload);
	}
	publishAdminContent(id: string): Promise<QuestionAdminMutationResult> {
		return this.questionSource.publishAdminContent(id);
	}
	removeAdminContent(id: string): Promise<void> {
		return this.questionSource.removeAdminContent(id);
	}
	restoreAdminContent(id: string): Promise<void> {
		return this.questionSource.restoreAdminContent(id);
	}
	getAdminTemplates(
		options?: PaginationQueryOptions & { script?: string }
	): Promise<PaginatedResult<QuestionKanaTemplateMetadata>> {
		return this.questionSource.getAdminTemplates(options);
	}
	getAdminTemplate(id: string): Promise<QuestionKanaTemplateDetail> {
		return this.questionSource.getAdminTemplate(id);
	}
	previewAdminTemplate(input: QuestionKanaTemplateInput): Promise<QuestionKanaTemplatePreview> {
		return this.questionSource.previewAdminTemplate(input);
	}
	saveAdminTemplate(
		id: string | null,
		input: QuestionKanaTemplateInput
	): Promise<QuestionKanaTemplateDetail> {
		return this.questionSource.saveAdminTemplate(id, input);
	}
}
