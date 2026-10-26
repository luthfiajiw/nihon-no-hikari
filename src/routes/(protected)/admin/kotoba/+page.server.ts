import { kotobaRepository } from '$dependencies/kotoba.dependency';
import { kotobaLoad } from '$features/kotoba/presentation/server/kotoba-loaders';
import { adminTopic } from '$features/admin/presentation/models/admin-kotoba-api.model';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ depends }) => {
	depends('kotoba:topics');
	return kotobaLoad(async () => ({ topics: (await kotobaRepository.list(true)).map(adminTopic) }));
};
