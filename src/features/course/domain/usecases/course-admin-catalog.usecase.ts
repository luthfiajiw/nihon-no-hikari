import type { CourseAdminRepository } from '../repositories/course-admin.repository';
export class GetCourseAdminCatalogUseCase {
	constructor(private readonly repository: CourseAdminRepository) {}
	exec() {
		return this.repository.getAdminCatalog();
	}
}
