import { getCourseModulesUseCase } from '../../../../../dependencies/course.dependency';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const response = await getCourseModulesUseCase.exec(params.id);

		return {
			courseId: params.id,
			moduleLessons: response.data,
			moduleLessonsError: null
		};
	} catch (error) {
		return {
			courseId: params.id,
			moduleLessons: [],
			moduleLessonsError:
				error instanceof Error ? error.message : 'Gagal mengambil modul dan materi kursus.'
		};
	}
};
