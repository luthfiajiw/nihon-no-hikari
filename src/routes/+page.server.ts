import type { PageServerLoad } from './$types';
import { getPublicLevelsUseCase } from '$dependencies/course.dependency';

export const load: PageServerLoad = async ({ locals }) => {
	const levels = await getPublicLevelsUseCase.exec().catch(() => []);
	return {
		user: locals.user ?? null,
		levels
	};
};
