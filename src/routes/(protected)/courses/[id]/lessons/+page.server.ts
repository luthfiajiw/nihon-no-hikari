import { getCourseModulesUseCase } from '../../../../../dependencies/course.dependency';
import { apiClient } from '../../../../../dependencies/api.dependency';
import type { QuestionSet } from '$features/question/domain/entities/question.entity';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const response = await getCourseModulesUseCase.exec(params.id);
		const moduleExams: Record<string, QuestionSet[]> = {};
		await Promise.all(response.data.map(async ({ module }) => {
			const result = await apiClient.request<{ data: QuestionSet[] }>(`/v1/modules/${encodeURIComponent(module.id)}/question-sets`, { method: 'GET' });
			moduleExams[module.id] = result.ok ? result.data.data : [];
		}));

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
