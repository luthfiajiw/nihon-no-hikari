import { getListCoursesUseCase } from '../../../dependencies/course.dependency';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const response = await getListCoursesUseCase.exec();

		return {
			courses: response.data,
			courseError: null
		};
	} catch (error) {
		return {
			courses: [],
			courseError: error instanceof Error ? error.message : 'Gagal mengambil daftar kursus.'
		};
	}
};
