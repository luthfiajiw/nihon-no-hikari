import type { CourseLevelItem } from '../entities/course.entity';
import type { CourseRepository } from '../repositories/course.repository';

export class GetPublicLevelsUseCase {
	constructor(private readonly repository: CourseRepository) {}

	exec(): Promise<CourseLevelItem[]> {
		return this.repository.getPublicLevels();
	}
}
