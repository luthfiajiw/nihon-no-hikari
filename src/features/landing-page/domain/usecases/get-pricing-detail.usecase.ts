import type { PricingDetail } from '../entities/landing-pricing.entity';
import type { LandingPricingRepository } from '../repositories/landing-pricing.repository';

export class GetPricingDetailUseCase {
	constructor(private readonly repository: LandingPricingRepository) {}

	exec(code: string): Promise<PricingDetail> {
		return this.repository.getPricingDetail(code);
	}
}
