import { requestFetch } from '#request-fetch';
import { LandingPricingSource } from '$features/landing-page/data/sources/landing-pricing.source';
import { LandingPricingRepositoryImpl } from '$features/landing-page/data/repositories/landing-pricing.repository.impl';
import { GetPricingPlansUseCase } from '$features/landing-page/domain/usecases/get-pricing-plans.usecase';
import { GetPricingDetailUseCase } from '$features/landing-page/domain/usecases/get-pricing-detail.usecase';

const landingPricingSource = new LandingPricingSource(requestFetch);
const landingPricingRepository = new LandingPricingRepositoryImpl(landingPricingSource);

export const getPricingPlansUseCase = new GetPricingPlansUseCase(landingPricingRepository);
export const getPricingDetailUseCase = new GetPricingDetailUseCase(landingPricingRepository);
