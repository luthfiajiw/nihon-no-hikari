import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPricingDetailUseCase } from '$dependencies/landing-page.dependency';
import { PricingNotFoundError } from '$features/landing-page/domain/entities/landing-pricing.entity';

export const load: PageServerLoad = async ({ params, locals }) => {
	const code = params.code;
	try {
		const detail = await getPricingDetailUseCase.exec(code);
		return {
			user: locals.user ?? null,
			detail
		};
	} catch (err) {
		if (err instanceof PricingNotFoundError) {
			throw error(404, err.message);
		}
		throw error(404, `Paket belajar level ${params.code} tidak ditemukan.`);
	}
};
