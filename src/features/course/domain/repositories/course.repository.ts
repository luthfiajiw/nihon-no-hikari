import type {
	CourseDetailResponse,
	ListCourseResponse,
	UpdateModuleProgressRequest,
	UpdateModuleProgressResponse
} from '../entities/course.entity';

export interface CourseRepository {
	getList(): Promise<ListCourseResponse>;
	getDetail(id: string): Promise<CourseDetailResponse>;
	updateModuleProgress(
		courseId: string,
		moduleId: string,
		payload: UpdateModuleProgressRequest
	): Promise<UpdateModuleProgressResponse>;
}
