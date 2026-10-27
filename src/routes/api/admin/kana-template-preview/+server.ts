import { previewQuestionKanaTemplate } from '$features/question/presentation/server/question-kana-template-adapters';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = previewQuestionKanaTemplate;
