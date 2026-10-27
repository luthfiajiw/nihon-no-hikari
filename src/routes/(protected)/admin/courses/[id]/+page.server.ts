import { loadCourseAdminDetail } from '$features/course/presentation/server/course-admin-loaders';
import { reorderCourseAdminContent } from '$features/course/presentation/server/course-admin-actions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = loadCourseAdminDetail;
export const actions: Actions = { reorder: reorderCourseAdminContent };
