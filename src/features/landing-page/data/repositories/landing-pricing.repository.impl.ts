import type { LandingPricingRepository } from '../../domain/repositories/landing-pricing.repository';
import type { PricingPlan, PricingDetail } from '../../domain/entities/landing-pricing.entity';
import type { LandingPricingSource } from '../sources/landing-pricing.source';

export class LandingPricingRepositoryImpl implements LandingPricingRepository {
	constructor(private readonly source: LandingPricingSource) {}

	getPricingPlans(): Promise<PricingPlan[]> {
		return this.source.getPricingPlans();
	}

	getPricingDetail(code: string): Promise<PricingDetail> {
		return this.source.getPricingDetail(code);
	}
}
