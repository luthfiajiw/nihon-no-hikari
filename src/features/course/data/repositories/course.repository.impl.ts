import type { CourseAdminRepository } from '../../domain/repositories/course-admin.repository';
import type {
	CourseAdminReorderKind,
	CourseAdminReorderInput,
	CourseAdminCatalog,
	CourseAdminContentKind,
	CourseAdminContentDetail,
	CourseAdminRecord,
	CourseAdminContentRecord,
	CourseAdminMutationResult,
	CourseAdminLessonContent
} from '../../domain/entities/course-admin.entity';
import type {
	CourseDetailResponse,
	ListCourseResponse,
	UpdateModuleProgressRequest,
	UpdateModuleProgressResponse
} from '../../domain/entities/course.entity';
import type {
	LessonDetailResponse,
	ListModuleLessonResponse,
	UpdateLessonProgressRequest,
	UpdateLessonProgressResponse
} from '../../domain/entities/lesson.entity';
import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseSource } from '../sources/course.source';

export class CourseRepositoryImpl implements CourseRepository, CourseAdminRepository {
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

	getLesson(lessonId: string): Promise<LessonDetailResponse> {
		return this.courseSource.getLesson(lessonId);
	}

	updateModuleProgress(
		courseId: string,
		moduleId: string,
		payload: UpdateModuleProgressRequest
	): Promise<UpdateModuleProgressResponse> {
		return this.courseSource.updateModuleProgress(courseId, moduleId, payload);
	}

	updateLessonProgress(
		lessonId: string,
		payload: UpdateLessonProgressRequest
	): Promise<UpdateLessonProgressResponse> {
		return this.courseSource.updateLessonProgress(lessonId, payload);
	}
	reorderAdminContent(kind: CourseAdminReorderKind, input: CourseAdminReorderInput): Promise<void> {
		return this.courseSource.reorderAdminContent(kind, input);
	}
	getAdminCatalog(courseId?: string): Promise<CourseAdminCatalog> {
		return this.courseSource.getAdminCatalog(courseId);
	}
	getAdminContentList(kind: CourseAdminContentKind): Promise<CourseAdminRecord[]> {
		return this.courseSource.getAdminContentList(kind);
	}
	getAdminContent(kind: CourseAdminContentKind, id: string): Promise<CourseAdminContentDetail> {
		return this.courseSource.getAdminContent(kind, id);
	}
	getAdminLevels(): Promise<CourseAdminContentRecord[]> {
		return this.courseSource.getAdminLevels();
	}
	saveAdminContent(
		kind: CourseAdminContentKind,
		id: string | null,
		payload: CourseAdminContentRecord
	): Promise<CourseAdminMutationResult> {
		return this.courseSource.saveAdminContent(kind, id, payload);
	}
	publishAdminContent(
		kind: CourseAdminContentKind,
		id: string
	): Promise<CourseAdminMutationResult> {
		return this.courseSource.publishAdminContent(kind, id);
	}
	removeAdminContent(kind: CourseAdminContentKind, id: string): Promise<void> {
		return this.courseSource.removeAdminContent(kind, id);
	}
	restoreAdminContent(kind: CourseAdminContentKind, id: string): Promise<void> {
		return this.courseSource.restoreAdminContent(kind, id);
	}
	previewAdminLesson(content: CourseAdminLessonContent): Promise<CourseAdminLessonContent> {
		return this.courseSource.previewAdminLesson(content);
	}
}
