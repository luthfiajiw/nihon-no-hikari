import type {
	UpdateLessonProgressRequest,
	UpdateLessonProgressResponse
} from '../entities/lesson.entity';
import type { CourseRepository } from '../repositories/course.repository';

export class UpdateLessonProgressUseCase {
	constructor(private readonly courseRepository: CourseRepository) {}

	exec(
		lessonId: string,
		payload: UpdateLessonProgressRequest
	): Promise<UpdateLessonProgressResponse> {
		return this.courseRepository.updateLessonProgress(lessonId, payload);
	}
}
