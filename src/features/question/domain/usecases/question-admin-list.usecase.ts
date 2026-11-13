import type { QuestionAdminRepository } from '../repositories/question-admin.repository';
import type { PaginatedResult, PaginationQueryOptions } from '$lib/models/pagination.model';
import { defaultPaginationMeta } from '$lib/models/pagination.model';
import type { QuestionAdminRecord } from '../entities/question-admin.entity';

export class GetQuestionAdminSetsUseCase {
	constructor(private readonly repository: QuestionAdminRepository) {}
	async exec(
		options?: PaginationQueryOptions & { skill?: string; kind?: string; status?: string }
	): Promise<PaginatedResult<QuestionAdminRecord>> {
		const res = await this.repository.getAdminContentList(options);
		if (Array.isArray(res)) {
			return {
				items: res,
				meta: defaultPaginationMeta(res.length, options?.limit ?? 10, options?.page ?? 1)
			};
		}
		return res;
	}
}
