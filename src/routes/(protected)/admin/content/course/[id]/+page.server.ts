import { loadCourseAdminEditor } from '$features/course/presentation/server/course-admin-loaders';
import { manageCourseAdminContent } from '$features/course/presentation/server/course-admin-actions';
import type { PageServerLoad, Actions } from './$types';
export const load: PageServerLoad = (event) => loadCourseAdminEditor(event, 'course');
export const actions: Actions = {
	save: (event) => manageCourseAdminContent(event, 'course', 'save'),
	publish: (event) => manageCourseAdminContent(event, 'course', 'publish'),
	remove: (event) => manageCourseAdminContent(event, 'course', 'remove'),
	restore: (event) => manageCourseAdminContent(event, 'course', 'restore')
};
