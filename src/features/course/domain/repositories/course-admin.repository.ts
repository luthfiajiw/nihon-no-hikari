import type {
	CourseAdminReorderKind,
	CourseAdminReorderInput,
	CourseAdminCatalog,
	CourseAdminContentKind,
	CourseAdminContentDetail,
	CourseAdminRecord,
	CourseAdminContentRecord,
	CourseAdminLevel,
	CourseAdminLevelInput,
	CourseAdminLevelsQueryOptions,
	CourseAdminListQueryOptions,
	CourseAdminMutationResult,
	CourseAdminLessonContent
} from '../entities/course-admin.entity';
import type { PaginatedResult } from '$lib/models/pagination.model';
export interface CourseAdminRepository {
	reorderAdminContent(kind: CourseAdminReorderKind, input: CourseAdminReorderInput): Promise<void>;
	getAdminCatalog(courseId?: string): Promise<CourseAdminCatalog>;
	getAdminContentList(
		kind: CourseAdminContentKind,
		options?: CourseAdminListQueryOptions
	): Promise<PaginatedResult<CourseAdminRecord> | CourseAdminRecord[]>;
	getAdminContent(kind: CourseAdminContentKind, id: string): Promise<CourseAdminContentDetail>;
	getAdminLevels(
		options?: CourseAdminLevelsQueryOptions
	): Promise<PaginatedResult<CourseAdminLevel> | CourseAdminLevel[]>;
	getAdminLevel(id: string): Promise<CourseAdminLevel>;
	createAdminLevel(input: CourseAdminLevelInput): Promise<CourseAdminLevel>;
	updateAdminLevel(id: string, input: CourseAdminLevelInput): Promise<CourseAdminLevel>;
	deleteAdminLevel(id: string): Promise<void>;
	updateAdminLevelPrice(id: string, price: number): Promise<CourseAdminLevel>;
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
