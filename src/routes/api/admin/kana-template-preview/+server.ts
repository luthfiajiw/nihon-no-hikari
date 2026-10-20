import { previewKanaTemplate } from '$features/admin/presentation/server/kana-template-adapters';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = previewKanaTemplate;
