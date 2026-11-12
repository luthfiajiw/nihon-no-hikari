import type {
	CourseAdminCatalog,
	CourseAdminLevel,
	CourseAdminRecord
} from '../../domain/entities/course-admin.entity';
import type { PaginationMeta } from '$lib/models/pagination.model';
export type CourseAdminDashboardData = { catalog: CourseAdminCatalog };
export type CourseAdminCoursesData = { courses: CourseAdminRecord[] };
export type CourseAdminLevelsData = { levels: CourseAdminLevel[]; meta?: PaginationMeta };
export type CourseAdminDetailData = {
	course: CourseAdminRecord;
	modules: CourseAdminRecord[];
	lessons: CourseAdminRecord[];
};
