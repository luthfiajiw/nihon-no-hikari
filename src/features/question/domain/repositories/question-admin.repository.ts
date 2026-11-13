import type {
	QuestionAdminRecord,
	QuestionAdminContentRecord,
	QuestionAdminContentDetail,
	QuestionAdminMutationResult
} from '../entities/question-admin.entity';
import type {
	QuestionKanaTemplateMetadata,
	QuestionKanaTemplateDetail,
	QuestionKanaTemplateInput,
	QuestionKanaTemplatePreview
} from '../entities/question-kana-template.entity';
import type { PaginatedResult, PaginationQueryOptions } from '$lib/models/pagination.model';
export interface QuestionAdminRepository {
	getAdminContentList(
		options?: PaginationQueryOptions & { skill?: string; kind?: string; status?: string }
	): Promise<PaginatedResult<QuestionAdminRecord> | QuestionAdminRecord[]>;
	getAdminContent(id: string): Promise<QuestionAdminContentDetail>;
	saveAdminContent(
		id: string | null,
		payload: QuestionAdminContentRecord
	): Promise<QuestionAdminMutationResult>;
	publishAdminContent(id: string): Promise<QuestionAdminMutationResult>;
	removeAdminContent(id: string): Promise<void>;
	restoreAdminContent(id: string): Promise<void>;
	getAdminTemplates(
		options?: PaginationQueryOptions & { script?: string }
	): Promise<PaginatedResult<QuestionKanaTemplateMetadata> | QuestionKanaTemplateMetadata[]>;
	getAdminTemplate(id: string): Promise<QuestionKanaTemplateDetail>;
	previewAdminTemplate(input: QuestionKanaTemplateInput): Promise<QuestionKanaTemplatePreview>;
	saveAdminTemplate(
		id: string | null,
		input: QuestionKanaTemplateInput
	): Promise<QuestionKanaTemplateDetail>;
	deleteAdminTemplate(id: string): Promise<void>;
}
