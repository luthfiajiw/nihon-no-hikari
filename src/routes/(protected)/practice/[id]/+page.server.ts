import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const courseId = url.searchParams.get('courseId');
	const lessonId = url.searchParams.get('lessonId');
	const backHref = courseId ? `/courses/${encodeURIComponent(courseId)}/lessons` : '/courses';

	return {
		questionSetId: params.id,
		courseId,
		lessonId,
		backHref,
		errorMessage:
			courseId && lessonId ? null : 'Kursus atau materi untuk set soal ini tidak ditemukan.'
	};
};
