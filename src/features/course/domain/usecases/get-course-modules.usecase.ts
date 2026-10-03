import type { ListModuleLessonResponse } from '../entities/lesson.entity';
import type { CourseRepository } from '../repositories/course.repository';

export class GetCourseModulesUseCase {
	constructor(private readonly courseRepository: CourseRepository) {}

	exec(courseId: string): Promise<ListModuleLessonResponse> {
		return this.courseRepository.getModules(courseId);
	}
}
