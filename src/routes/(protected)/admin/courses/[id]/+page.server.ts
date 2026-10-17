import { loadAdminCourseDetail } from '$features/admin/presentation/server/admin-loaders';
import { reorderAdminContent } from '$features/admin/presentation/server/admin-actions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = loadAdminCourseDetail;
export const actions: Actions = { reorder: reorderAdminContent };
