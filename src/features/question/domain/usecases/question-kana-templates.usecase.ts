import type {
	QuestionKanaTemplateInput,
	QuestionKanaTemplateMetadata
} from '$features/question/domain/entities/question-kana-template.entity';
import type { QuestionAdminRepository } from '../repositories/question-admin.repository';
import type { PaginatedResult, PaginationQueryOptions } from '$lib/models/pagination.model';
import { defaultPaginationMeta } from '$lib/models/pagination.model';

export class QuestionKanaTemplatesUseCase {
	constructor(private readonly repository: QuestionAdminRepository) {}
	async list(
		options?: PaginationQueryOptions & { script?: string }
	): Promise<PaginatedResult<QuestionKanaTemplateMetadata>> {
		const res = await this.repository.getAdminTemplates(options);
		if (Array.isArray(res)) {
			return {
				items: res,
				meta: defaultPaginationMeta(res.length, options?.limit ?? 10, options?.page ?? 1)
			};
		}
		return res;
	}
	detail(id: string) {
		return this.repository.getAdminTemplate(id);
	}
	preview(input: QuestionKanaTemplateInput) {
		return this.repository.previewAdminTemplate(input);
	}
	save(id: string | null, input: QuestionKanaTemplateInput) {
		return this.repository.saveAdminTemplate(id, input);
	}
	remove(id: string) {
		return this.repository.deleteAdminTemplate(id);
	}
}
