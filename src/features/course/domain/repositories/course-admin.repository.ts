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
} from '../entities/course-admin.entity';
export interface CourseAdminRepository {
	reorderAdminContent(kind: CourseAdminReorderKind, input: CourseAdminReorderInput): Promise<void>;
	getAdminCatalog(courseId?: string): Promise<CourseAdminCatalog>;
	getAdminContentList(kind: CourseAdminContentKind): Promise<CourseAdminRecord[]>;
	getAdminContent(kind: CourseAdminContentKind, id: string): Promise<CourseAdminContentDetail>;
	getAdminLevels(): Promise<CourseAdminContentRecord[]>;
	saveAdminContent(
		kind: CourseAdminContentKind,
		id: string | null,
		payload: CourseAdminContentRecord
	): Promise<CourseAdminMutationResult>;
	publishAdminContent(kind: CourseAdminContentKind, id: string): Promise<CourseAdminMutationResult>;
	removeAdminContent(kind: CourseAdminContentKind, id: string): Promise<void>;
	restoreAdminContent(kind: CourseAdminContentKind, id: string): Promise<void>;
	previewAdminLesson(content: CourseAdminLessonContent): Promise<CourseAdminLessonContent>;
}
