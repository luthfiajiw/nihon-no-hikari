import { loadAdminEditor } from '$features/admin/presentation/server/admin-loaders';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = loadAdminEditor;

import { manageAdminContent } from '$features/admin/presentation/server/admin-actions';
export const actions: Actions = {
	save: (event) => manageAdminContent(event, 'save'),
	publish: (event) => manageAdminContent(event, 'publish'),
	remove: (event) => manageAdminContent(event, 'remove'),
	restore: (event) => manageAdminContent(event, 'restore')
};
