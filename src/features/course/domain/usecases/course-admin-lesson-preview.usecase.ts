import type { CourseAdminLessonContent } from '$features/course/domain/entities/course-admin.entity';
import type { CourseAdminRepository } from '../repositories/course-admin.repository';
export class PreviewCourseAdminLessonUseCase {
	constructor(private readonly repository: CourseAdminRepository) {}
	exec(content: CourseAdminLessonContent): Promise<CourseAdminLessonContent> {
		return this.repository.previewAdminLesson(content);
	}
}
