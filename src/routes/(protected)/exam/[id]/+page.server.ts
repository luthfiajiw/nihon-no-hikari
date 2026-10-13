import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const courseId = url.searchParams.get('courseId');
	const moduleId = url.searchParams.get('moduleId');
	const backHref = courseId ? `/courses/${encodeURIComponent(courseId)}/lessons` : '/courses';

	return {
		questionSetId: params.id,
		courseId,
		moduleId,
		backHref,
		errorMessage:
			courseId && moduleId ? null : 'Kursus atau module untuk ujian ini tidak ditemukan.'
	};
};
