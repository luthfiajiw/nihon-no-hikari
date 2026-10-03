import type {
	CourseDetailResponse,
	ListCourseResponse,
	UpdateModuleProgressRequest,
	UpdateModuleProgressResponse
} from '../../domain/entities/course.entity';
import type {
	LessonDetailResponse,
	ListModuleLessonResponse
} from '../../domain/entities/lesson.entity';
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

	getModules(courseId: string): Promise<ListModuleLessonResponse> {
		return this.courseSource.getModules(courseId);
	}

	getLesson(courseId: string, lessonId: string): Promise<LessonDetailResponse> {
		return this.courseSource.getLesson(courseId, lessonId);
	}

	updateModuleProgress(
		courseId: string,
		moduleId: string,
		payload: UpdateModuleProgressRequest
	): Promise<UpdateModuleProgressResponse> {
		return this.courseSource.updateModuleProgress(courseId, moduleId, payload);
	}
}
