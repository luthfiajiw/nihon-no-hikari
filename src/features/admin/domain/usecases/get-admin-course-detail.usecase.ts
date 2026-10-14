import type { AdminRecord } from '../entities/admin.entity';
import type { AdminRepository } from '../repositories/admin.repository';
export class GetAdminCourseDetailUseCase {
	constructor(private readonly repository: AdminRepository) {}
	async exec(id: string) {
		const [course, catalog] = await Promise.all([
			this.repository.getContent('course', id),
			this.repository.getCatalog(id)
		]);
		return {
			course: course.data as AdminRecord,
			modules: catalog.modules,
			lessons: catalog.lessons
		};
	}
}
