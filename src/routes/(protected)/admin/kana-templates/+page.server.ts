import { loadKanaTemplates } from '$features/admin/presentation/server/kana-template-adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = loadKanaTemplates;
