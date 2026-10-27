import { loadCourseAdminEditor } from '$features/course/presentation/server/course-admin-loaders';
import { manageCourseAdminContent } from '$features/course/presentation/server/course-admin-actions';
import type { PageServerLoad, Actions } from './$types';
export const load: PageServerLoad = (event) => loadCourseAdminEditor(event, 'module');
export const actions: Actions = {
	save: (event) => manageCourseAdminContent(event, 'module', 'save'),
	publish: (event) => manageCourseAdminContent(event, 'module', 'publish'),
	remove: (event) => manageCourseAdminContent(event, 'module', 'remove'),
	restore: (event) => manageCourseAdminContent(event, 'module', 'restore')
};
