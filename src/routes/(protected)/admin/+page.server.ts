import { loadAdminDashboard } from '$features/admin/presentation/server/admin-loaders';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = loadAdminDashboard;
