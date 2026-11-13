import type {
	CourseAdminContentKind,
	CourseAdminListQueryOptions,
	CourseAdminRecord
} from '$features/course/domain/entities/course-admin.entity';
import type { CourseAdminRepository } from '../repositories/course-admin.repository';
import { defaultPaginationMeta, type PaginatedResult } from '$lib/models/pagination.model';

export class GetCourseAdminContentListUseCase {
	constructor(private readonly repository: CourseAdminRepository) {}

	async exec(
		kind: CourseAdminContentKind,
		options?: CourseAdminListQueryOptions
	): Promise<PaginatedResult<CourseAdminRecord>> {
		const res = await this.repository.getAdminContentList(kind, options);
		if (Array.isArray(res)) {
			return {
				items: res,
				meta: defaultPaginationMeta(res.length, options?.limit ?? 10, options?.page ?? 1)
			};
		}
		return res;
	}
}
