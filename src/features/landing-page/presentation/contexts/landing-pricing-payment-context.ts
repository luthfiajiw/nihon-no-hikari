import { createContext } from 'svelte';
import type { PricingDetail } from '../../domain/entities/landing-pricing.entity';

export interface LandingPricingPaymentSelection {
	selectedPackage: PricingDetail | null;
}

export interface LandingPricingPaymentContext extends Readonly<LandingPricingPaymentSelection> {
	setPackage: (detail: PricingDetail) => void;
	clearPackage: () => void;
}

export const [getLandingPricingPaymentContext, setLandingPricingPaymentContext] =
	createContext<LandingPricingPaymentContext>();
