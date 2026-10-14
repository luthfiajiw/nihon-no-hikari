import type { AdminCatalog, AdminRecord, ManagedUser } from '../../domain/entities/admin.entity';
import type { AuthUser } from '$features/auth/domain/entities/auth.entity';
export type AdminDashboardData = { catalog: AdminCatalog };
export type AdminCoursesData = { courses: AdminRecord[] };
export type AdminCourseDetailData = {
	course: AdminRecord;
	modules: AdminRecord[];
	lessons: AdminRecord[];
};
export type AdminQuestionSetsData = { sets: AdminRecord[] };
export type AdminUsersData = { users: ManagedUser[]; user?: AuthUser | null };
export type AdminFormResult = { message?: string } | null;
