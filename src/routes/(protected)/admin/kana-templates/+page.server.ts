import { loadQuestionKanaTemplates } from '$features/question/presentation/server/question-kana-template-adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = loadQuestionKanaTemplates;
