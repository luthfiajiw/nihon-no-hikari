import {
	type PricingDetail,
	type PricingDetailResponse,
	type PricingListResponse,
	type PricingPlan,
	PricingNotFoundError
} from '../../domain/entities/landing-pricing.entity';

type ErrorResponse = { error?: string; message?: string };

export class LandingPricingSource {
	constructor(private readonly fetcher: typeof fetch) {}

	async getPricingPlans(): Promise<PricingPlan[]> {
		const response = await this.fetcher('/api/v1/pricing', {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});
		const data = (await response.json().catch(() => ({}))) as PricingListResponse & ErrorResponse;

		if (!response.ok) {
			throw new Error(data?.error || data?.message || 'Gagal mengambil daftar harga paket.');
		}

		return data.data ?? [];
	}

	async getPricingDetail(code: string): Promise<PricingDetail> {
		const response = await this.fetcher(`/api/v1/pricing/${encodeURIComponent(code)}`, {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});

		if (response.status === 404) {
			throw new PricingNotFoundError(code);
		}

		const data = (await response.json().catch(() => ({}))) as PricingDetailResponse & ErrorResponse;

		if (!response.ok || !data.data) {
			throw new Error(data?.error || data?.message || 'Gagal mengambil detail harga paket.');
		}

		return data.data;
	}
}
