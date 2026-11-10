import type { PricingPlan, PricingDetail } from '../entities/landing-pricing.entity';

export interface LandingPricingRepository {
	getPricingPlans(): Promise<PricingPlan[]>;
	getPricingDetail(code: string): Promise<PricingDetail>;
}
