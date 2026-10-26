import { loadKotobaEditor } from '$features/kotoba/presentation/server/kotoba-loaders';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = ({ params }) => loadKotobaEditor(params.id);
