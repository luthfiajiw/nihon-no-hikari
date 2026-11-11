import { describe, expect, it } from 'vitest';
import { GetPricingPaymentSummaryUseCase } from './get-pricing-payment-summary.usecase';

describe('GetPricingPaymentSummaryUseCase', () => {
	const useCase = new GetPricingPaymentSummaryUseCase();

	it('computes payment summary for standard price', () => {
		const summary = useCase.exec(49000);
		expect(summary).toEqual({
			subtotal: 49000,
			serviceFee: 0,
			total: 49000
		});
	});

	it('handles free price correctly', () => {
		const summary = useCase.exec(0);
		expect(summary).toEqual({
			subtotal: 0,
			serviceFee: 0,
			total: 0
		});
	});

	it('clamps negative price to zero', () => {
		const summary = useCase.exec(-1000);
		expect(summary).toEqual({
			subtotal: 0,
			serviceFee: 0,
			total: 0
		});
	});
});
