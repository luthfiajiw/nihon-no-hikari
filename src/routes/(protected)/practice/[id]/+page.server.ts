import { getQuestionSetDetailUseCase } from '../../../../dependencies/question.dependency';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const courseId = url.searchParams.get('courseId');
	const lessonId = url.searchParams.get('lessonId');
	const backHref = courseId ? `/courses/${encodeURIComponent(courseId)}/lessons` : '/courses';

	if (!courseId || !lessonId) {
		return {
			questionSet: null,
			backHref,
			errorMessage: 'Kursus atau materi untuk set soal ini tidak ditemukan.'
		};
	}

	try {
		const response = await getQuestionSetDetailUseCase.exec(courseId, lessonId, params.id);

		if (response.data.kind !== 'practice') {
			return {
				questionSet: null,
				backHref,
				errorMessage: 'Jenis set soal tidak sesuai dengan halaman yang dibuka.'
			};
		}

		return {
			questionSet: response.data,
			backHref,
			errorMessage: null
		};
	} catch (error) {
		return {
			questionSet: null,
			backHref,
			errorMessage: error instanceof Error ? error.message : 'Gagal mengambil detail set soal.'
		};
	}
};
