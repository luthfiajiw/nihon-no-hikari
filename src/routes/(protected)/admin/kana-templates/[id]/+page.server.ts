import {
	loadKanaTemplateEditor,
	saveKanaTemplate
} from '$features/admin/presentation/server/kana-template-adapters';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = loadKanaTemplateEditor;
export const actions: Actions = { save: saveKanaTemplate };
