import { loadCourseAdminEditor } from '$features/course/presentation/server/course-admin-loaders';
import { manageCourseAdminContent } from '$features/course/presentation/server/course-admin-actions';
import type { PageServerLoad, Actions } from './$types';
export const load: PageServerLoad = (event) => loadCourseAdminEditor(event, 'lesson');
export const actions: Actions = {
	save: (event) => manageCourseAdminContent(event, 'lesson', 'save'),
	publish: (event) => manageCourseAdminContent(event, 'lesson', 'publish'),
	remove: (event) => manageCourseAdminContent(event, 'lesson', 'remove'),
	restore: (event) => manageCourseAdminContent(event, 'lesson', 'restore')
};
