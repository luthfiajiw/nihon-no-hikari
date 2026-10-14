import { loadAdminAccess } from '$features/admin/presentation/server/admin-loaders';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = loadAdminAccess;
