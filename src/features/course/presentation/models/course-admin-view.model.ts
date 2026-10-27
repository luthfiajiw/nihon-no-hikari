import type {
	CourseAdminCatalog,
	CourseAdminRecord
} from '../../domain/entities/course-admin.entity';
export type CourseAdminDashboardData = { catalog: CourseAdminCatalog };
export type CourseAdminCoursesData = { courses: CourseAdminRecord[] };
export type CourseAdminDetailData = {
	course: CourseAdminRecord;
	modules: CourseAdminRecord[];
	lessons: CourseAdminRecord[];
};
