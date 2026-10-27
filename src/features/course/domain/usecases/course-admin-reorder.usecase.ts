import type {
	CourseAdminReorderInput,
	CourseAdminReorderKind
} from '$features/course/domain/entities/course-admin.entity';
import type { CourseAdminRepository } from '../repositories/course-admin.repository';

export class ReorderCourseAdminContentUseCase {
	constructor(private readonly repository: CourseAdminRepository) {}
	exec(kind: CourseAdminReorderKind, input: CourseAdminReorderInput): Promise<void> {
		return this.repository.reorderAdminContent(kind, input);
	}
}
