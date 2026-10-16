import { getCourseModulesUseCase } from '$dependencies/course.dependency';
import type { QuestionSet } from '$features/question/domain/entities/question.entity';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	try {
		const response = await getCourseModulesUseCase.exec(params.id);
		const moduleExams: Record<string, QuestionSet[]> = {};
		await Promise.all(
			response.data.map(async ({ module }) => {
				const result = await fetch(
					`/api/v1/modules/${encodeURIComponent(module.id)}/question-sets`,
					{ method: 'GET' }
				);
				moduleExams[module.id] = result.ok
					? ((await result.json()) as { data: QuestionSet[] }).data
					: [];
			})
		);

		return {
			courseId: params.id,
			moduleLessons: response.data,
			moduleExams,
			moduleLessonsError: null
		};
	} catch (error) {
		return {
			courseId: params.id,
			moduleLessons: [],
			moduleExams: {},
			moduleLessonsError:
				error instanceof Error ? error.message : 'Gagal mengambil modul dan materi kursus.'
		};
	}
};
