import type { PageServerLoad } from './$types';
import { getPublicLevelsUseCase } from '$dependencies/course.dependency';
import { getPricingPlansUseCase } from '$dependencies/landing-page.dependency';

export const load: PageServerLoad = async ({ locals }) => {
	const [levels, pricingPlans] = await Promise.all([
		getPublicLevelsUseCase.exec().catch(() => []),
		getPricingPlansUseCase.exec().catch(() => [])
	]);
	return {
		user: locals.user ?? null,
		levels,
		pricingPlans
	};
};
