import { getCourseDetailUseCase } from '../../../../dependencies/course.dependency';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const response = await getCourseDetailUseCase.exec(params.id);

		return {
			course: response.data,
			courseError: null
		};
	} catch (error) {
		return {
			course: null,
			courseError: error instanceof Error ? error.message : 'Gagal mengambil detail kursus.'
		};
	}
};
