import {
	loadQuestionKanaTemplateEditor,
	saveQuestionKanaTemplate
} from '$features/question/presentation/server/question-kana-template-adapters';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = loadQuestionKanaTemplateEditor;
export const actions: Actions = { save: saveQuestionKanaTemplate };
