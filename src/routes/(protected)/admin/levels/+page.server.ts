import { loadCourseAdminLevels } from '$features/course/presentation/server/course-admin-loaders';
import { updateCourseAdminLevelPrice } from '$features/course/presentation/server/course-admin-actions';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = loadCourseAdminLevels;
export const actions: Actions = { updatePrice: updateCourseAdminLevelPrice };
