import type { CourseAdminRecord } from '$features/course/domain/entities/course-admin.entity';
import type { CourseAdminRepository } from '../repositories/course-admin.repository';
export class GetCourseAdminDetailUseCase {
	constructor(private readonly repository: CourseAdminRepository) {}
	async exec(id: string) {
		const [course, catalog] = await Promise.all([
			this.repository.getAdminContent('course', id),
			this.repository.getAdminCatalog(id)
		]);
		return {
			course: course.data as CourseAdminRecord,
			modules: catalog.modules,
			lessons: catalog.lessons
		};
	}
}
