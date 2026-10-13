import { adminData } from '$lib/server/admin-api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const payload = await adminData<{ data: Record<string, unknown[]> }>(event, '/catalog');
	return { catalog: payload.data };
};
