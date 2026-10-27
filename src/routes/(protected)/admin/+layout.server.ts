import { loadAuthAdminAccess } from '$features/auth/presentation/server/auth-admin-loaders';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = loadAuthAdminAccess;
