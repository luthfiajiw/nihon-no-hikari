import { loadKotobaAdminEditor } from '$features/kotoba/presentation/server/kotoba-admin-loaders';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = ({ params }) => loadKotobaAdminEditor(params.id);
