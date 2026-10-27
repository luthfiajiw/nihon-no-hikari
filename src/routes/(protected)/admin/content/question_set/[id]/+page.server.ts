import { loadQuestionAdminEditor } from '$features/question/presentation/server/question-admin-loaders';
import { manageQuestionAdminContent } from '$features/question/presentation/server/question-admin-actions';
import type { PageServerLoad, Actions } from './$types';
export const load: PageServerLoad = (event) => loadQuestionAdminEditor(event);
export const actions: Actions = {
	save: (event) => manageQuestionAdminContent(event, 'save'),
	publish: (event) => manageQuestionAdminContent(event, 'publish'),
	remove: (event) => manageQuestionAdminContent(event, 'remove'),
	restore: (event) => manageQuestionAdminContent(event, 'restore')
};
