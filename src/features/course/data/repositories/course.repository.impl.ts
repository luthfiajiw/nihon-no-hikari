import type {
	CourseDetailResponse,
	ListCourseResponse,
	UpdateModuleProgressRequest,
	UpdateModuleProgressResponse
} from '../../domain/entities/course.entity';
import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseSource } from '../sources/course.source';

export class CourseRepositoryImpl implements CourseRepository {
	constructor(private readonly courseSource: CourseSource) {}

	getList(): Promise<ListCourseResponse> {
		return this.courseSource.getList();
	}

	getDetail(id: string): Promise<CourseDetailResponse> {
		return this.courseSource.getDetail(id);
	}

	updateModuleProgress(
		courseId: string,
		moduleId: string,
		payload: UpdateModuleProgressRequest
	): Promise<UpdateModuleProgressResponse> {
		return this.courseSource.updateModuleProgress(courseId, moduleId, payload);
	}
}
