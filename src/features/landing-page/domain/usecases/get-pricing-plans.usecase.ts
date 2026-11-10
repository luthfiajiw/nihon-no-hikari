import type { PricingPlan } from '../entities/landing-pricing.entity';
import type { LandingPricingRepository } from '../repositories/landing-pricing.repository';

export class GetPricingPlansUseCase {
	constructor(private readonly repository: LandingPricingRepository) {}

	exec(): Promise<PricingPlan[]> {
		return this.repository.getPricingPlans();
	}
}
