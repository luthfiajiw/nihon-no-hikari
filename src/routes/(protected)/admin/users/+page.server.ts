import { loadUserAdminList } from '$features/user/presentation/server/user-admin-loaders';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = loadUserAdminList;

import { changeUserAdminRole } from '$features/user/presentation/server/user-admin-actions';
export const actions: Actions = { changeRole: changeUserAdminRole };
