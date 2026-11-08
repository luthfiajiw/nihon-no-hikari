import type {
	CourseAdminCatalog,
	CourseAdminLevel,
	CourseAdminRecord
} from '../../domain/entities/course-admin.entity';
export type CourseAdminDashboardData = { catalog: CourseAdminCatalog };
export type CourseAdminCoursesData = { courses: CourseAdminRecord[] };
export type CourseAdminLevelsData = { levels: CourseAdminLevel[] };
export type CourseAdminDetailData = {
	course: CourseAdminRecord;
	modules: CourseAdminRecord[];
	lessons: CourseAdminRecord[];
};
