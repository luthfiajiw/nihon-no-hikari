import { adminData } from '$lib/server/admin-api';
import type { AdminRecord } from '$lib/admin';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async (event) => {
	const payload = await adminData<{ data: AdminRecord[] }>(event, '/content/question_set');
	return { sets: payload.data };
};
