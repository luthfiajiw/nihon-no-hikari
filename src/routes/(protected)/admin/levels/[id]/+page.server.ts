import { loadCourseAdminLevelEditor } from '$features/course/presentation/server/course-admin-loaders';
import {
	saveCourseAdminLevel,
	deleteCourseAdminLevel
} from '$features/course/presentation/server/course-admin-actions';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = loadCourseAdminLevelEditor;
export const actions: Actions = {
	save: saveCourseAdminLevel,
	remove: deleteCourseAdminLevel
};
