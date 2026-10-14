import { loadAdminUsers } from '$features/admin/presentation/server/admin-loaders';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = loadAdminUsers;

import { changeAdminUserRole } from '$features/admin/presentation/server/admin-actions';
export const actions: Actions = { changeRole: changeAdminUserRole };
