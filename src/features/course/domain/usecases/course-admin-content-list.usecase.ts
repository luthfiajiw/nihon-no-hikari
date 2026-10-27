import type { CourseAdminContentKind } from '$features/course/domain/entities/course-admin.entity';
import type { CourseAdminRepository } from '../repositories/course-admin.repository';
export class GetCourseAdminContentListUseCase {
	constructor(private readonly repository: CourseAdminRepository) {}
	exec(kind: CourseAdminContentKind) {
		return this.repository.getAdminContentList(kind);
	}
}
