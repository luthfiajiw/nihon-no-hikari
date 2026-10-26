import { requestFetch } from '#request-fetch';
import { KotobaRepositoryImpl } from '$features/kotoba/data/repositories/kotoba.repository.impl';

export const kotobaRepository = new KotobaRepositoryImpl(requestFetch);
