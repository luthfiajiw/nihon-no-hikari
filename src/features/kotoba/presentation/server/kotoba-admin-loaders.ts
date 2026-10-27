import type { ServerLoadEvent } from '@sveltejs/kit';
import { kotobaRepository } from '$dependencies/kotoba.dependency';
import { kotobaLoad } from './kotoba-loaders';
import { kotobaAdminTopic } from '../models/kotoba-admin-api.model';
import { emptyKotobaAdminTopic } from '../models/kotoba-admin.model';
export async function loadKotobaAdminEditor(id: string) {
	return kotobaLoad(async () => {
		if (id !== 'new') return { topic: kotobaAdminTopic(await kotobaRepository.detail(id, true)) };
		const records = await kotobaRepository.list(true);
		return {
			topic: emptyKotobaAdminTopic(Math.max(0, ...records.map((item) => item.order_index)) + 1)
		};
	});
}

export function loadKotobaAdminTopics({ depends }: Pick<ServerLoadEvent, 'depends'>) {
	depends('kotoba:topics');
	return kotobaLoad(async () => ({
		topics: (await kotobaRepository.list(true)).map(kotobaAdminTopic)
	}));
}
