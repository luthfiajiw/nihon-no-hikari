import type { ListCourseResponse } from '../entities/course.entity';
import type { CourseRepository } from '../repositories/course.repository';

export class GetListCoursesUseCase {
	constructor(private readonly courseRepository: CourseRepository) {}

	exec(): Promise<ListCourseResponse> {
		return this.courseRepository.getList();
	}
}
