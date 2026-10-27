import { loadQuestionAdminSets } from '$features/question/presentation/server/question-admin-loaders';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = loadQuestionAdminSets;
