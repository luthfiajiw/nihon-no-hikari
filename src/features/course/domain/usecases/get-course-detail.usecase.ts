import type { CourseDetailResponse } from '../entities/course.entity';
import type { CourseRepository } from '../repositories/course.repository';

export class GetCourseDetailUseCase {
	constructor(private readonly courseRepository: CourseRepository) {}

	exec(id: string): Promise<CourseDetailResponse> {
		return this.courseRepository.getDetail(id);
	}
}
