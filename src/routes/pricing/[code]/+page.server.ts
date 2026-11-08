import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPublicLevelsUseCase } from '$dependencies/course.dependency';
import { resolveLevelPricingDetail } from '$features/landing-page/domain/landing-pricing-data';

export const load: PageServerLoad = async ({ params, locals }) => {
	const code = params.code.toUpperCase();
	const levels = await getPublicLevelsUseCase.exec().catch(() => []);
	const level = levels.find((l) => l.code.toUpperCase() === code);
	if (!level && !['N5', 'N4', 'N3', 'N2', 'N1'].includes(code)) {
		throw error(404, `Paket belajar level ${params.code} tidak ditemukan.`);
	}
	const detail = resolveLevelPricingDetail(code, levels);
	return {
		user: locals.user ?? null,
		detail,
		levels
	};
};
