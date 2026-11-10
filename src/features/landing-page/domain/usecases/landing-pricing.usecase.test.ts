import { describe, expect, it, vi } from 'vitest';
import { GetPricingPlansUseCase } from './get-pricing-plans.usecase';
import { GetPricingDetailUseCase } from './get-pricing-detail.usecase';
import { LandingPricingSource } from '../../data/sources/landing-pricing.source';
import { LandingPricingRepositoryImpl } from '../../data/repositories/landing-pricing.repository.impl';
import { PricingNotFoundError, type PricingDetail, type PricingPlan } from '../entities/landing-pricing.entity';

describe('Landing Pricing UseCases & Repository', () => {
	const samplePlan: PricingPlan = {
		id: '1',
		code: 'N5',
		name: 'JLPT N5',
		tag: 'Favorit Pemula',
		description: 'Deskripsi N5',
		price: 49000,
		points: ['Poin 1'],
		order_index: 0
	};

	const sampleDetail: PricingDetail = {
		...samplePlan,
		total_modules: 1,
		total_lessons: 5,
		modules: [
			{
				id: 'm1',
				slug: 'fondasi',
				title: 'Fondasi Aksara',
				description: 'Deskripsi modul',
				estimated_minutes: 120,
				lesson_count: 5,
				order_index: 1,
				lessons: [
					{
						id: 'l1',
						slug: 'intro',
						title: 'Intro',
						order_index: 1
					}
				]
			}
		]
	};

	it('GetPricingPlansUseCase executes correctly', async () => {
		const repo = {
			getPricingPlans: vi.fn().mockResolvedValue([samplePlan]),
			getPricingDetail: vi.fn()
		};
		const useCase = new GetPricingPlansUseCase(repo);
		const result = await useCase.exec();
		expect(result).toEqual([samplePlan]);
		expect(repo.getPricingPlans).toHaveBeenCalled();
	});

	it('GetPricingDetailUseCase executes correctly', async () => {
		const repo = {
			getPricingPlans: vi.fn(),
			getPricingDetail: vi.fn().mockResolvedValue(sampleDetail)
		};
		const useCase = new GetPricingDetailUseCase(repo);
		const result = await useCase.exec('n5');
		expect(result).toEqual(sampleDetail);
		expect(repo.getPricingDetail).toHaveBeenCalledWith('n5');
	});

	it('LandingPricingSource handles getPricingPlans', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ success: true, data: [samplePlan] })
		});
		const source = new LandingPricingSource(mockFetch as unknown as typeof fetch);
		const repo = new LandingPricingRepositoryImpl(source);

		const result = await repo.getPricingPlans();
		expect(result).toEqual([samplePlan]);
		expect(mockFetch).toHaveBeenCalledWith('/api/v1/pricing', expect.any(Object));
	});

	it('LandingPricingSource handles 404 with PricingNotFoundError', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 404,
			json: async () => ({ success: false, error: 'level tidak ditemukan' })
		});
		const source = new LandingPricingSource(mockFetch as unknown as typeof fetch);

		await expect(source.getPricingDetail('UNKNOWN')).rejects.toThrow(PricingNotFoundError);
	});
});
