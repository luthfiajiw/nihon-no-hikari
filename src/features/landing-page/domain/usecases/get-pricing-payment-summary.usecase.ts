import type { PricingPaymentSummary } from '../entities/landing-pricing-payment.entity';

export class GetPricingPaymentSummaryUseCase {
	exec(price: number): PricingPaymentSummary {
		const subtotal = Math.max(0, price);
		const serviceFee = 0;
		const total = subtotal + serviceFee;

		return {
			subtotal,
			serviceFee,
			total
		};
	}
}
