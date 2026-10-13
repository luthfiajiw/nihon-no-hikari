import { adminData } from '$lib/server/admin-api';
import type { AdminCatalog, AdminRecord } from '$lib/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const id = encodeURIComponent(event.params.id);
	const [course, catalog] = await Promise.all([
		adminData<{ data: AdminRecord }>(event, `/content/course/${id}`),
		adminData<{ data: AdminCatalog }>(event, `/catalog?course_id=${id}`)
	]);
	return { course: course.data, modules: catalog.data.modules, lessons: catalog.data.lessons };
};
