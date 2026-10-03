import type {
	UpdateModuleProgressRequest,
	UpdateModuleProgressResponse
} from '../entities/course.entity';
import type { CourseRepository } from '../repositories/course.repository';

export class UpdateModuleProgressUseCase {
	constructor(private readonly courseRepository: CourseRepository) {}

	exec(
		courseId: string,
		moduleId: string,
		payload: UpdateModuleProgressRequest
	): Promise<UpdateModuleProgressResponse> {
		return this.courseRepository.updateModuleProgress(courseId, moduleId, payload);
	}
}
