import type {
	CourseDetailResponse,
	ListCourseResponse,
	UpdateModuleProgressRequest,
	UpdateModuleProgressResponse
} from '../entities/course.entity';
import type { LessonDetailResponse, ListModuleLessonResponse } from '../entities/lesson.entity';

export interface CourseRepository {
	getList(): Promise<ListCourseResponse>;
	getDetail(id: string): Promise<CourseDetailResponse>;
	getModules(courseId: string): Promise<ListModuleLessonResponse>;
	getLesson(courseId: string, lessonId: string): Promise<LessonDetailResponse>;
	updateModuleProgress(
		courseId: string,
		moduleId: string,
		payload: UpdateModuleProgressRequest
	): Promise<UpdateModuleProgressResponse>;
}
