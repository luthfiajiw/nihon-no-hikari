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
export interface QuestionAdminRepository {
	getAdminContentList(): Promise<QuestionAdminRecord[]>;
	getAdminContent(id: string): Promise<QuestionAdminContentDetail>;
	saveAdminContent(
		id: string | null,
		payload: QuestionAdminContentRecord
	): Promise<QuestionAdminMutationResult>;
	publishAdminContent(id: string): Promise<QuestionAdminMutationResult>;
	removeAdminContent(id: string): Promise<void>;
	restoreAdminContent(id: string): Promise<void>;
	getAdminTemplates(): Promise<QuestionKanaTemplateMetadata[]>;
	getAdminTemplate(id: string): Promise<QuestionKanaTemplateDetail>;
	previewAdminTemplate(input: QuestionKanaTemplateInput): Promise<QuestionKanaTemplatePreview>;
	saveAdminTemplate(
		id: string | null,
		input: QuestionKanaTemplateInput
	): Promise<QuestionKanaTemplateDetail>;
}
