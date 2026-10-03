import type { LessonDetailResponse } from '../entities/lesson.entity';
import type { CourseRepository } from '../repositories/course.repository';

export class GetLessonDetailUseCase {
	constructor(private readonly courseRepository: CourseRepository) {}

	exec(courseId: string, lessonId: string): Promise<LessonDetailResponse> {
		return this.courseRepository.getLesson(courseId, lessonId);
	}
}
