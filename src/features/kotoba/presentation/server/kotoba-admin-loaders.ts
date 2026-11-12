import type { ServerLoadEvent } from '@sveltejs/kit';
import { kotobaRepository } from '$dependencies/kotoba.dependency';
import { kotobaLoad } from './kotoba-loaders';
import { kotobaAdminTopic } from '../models/kotoba-admin-api.model';
import { emptyKotobaAdminTopic } from '../models/kotoba-admin.model';
import { parsePaginationParams } from '$lib/models/pagination.model';

export async function loadKotobaAdminEditor(id: string) {
	return kotobaLoad(async () => {
		if (id !== 'new') return { topic: kotobaAdminTopic(await kotobaRepository.detail(id, true)) };
		const records = await kotobaRepository.list(true);
		return {
			topic: emptyKotobaAdminTopic(Math.max(0, ...records.map((item) => item.order_index)) + 1)
		};
	});
}

export function loadKotobaAdminTopics(event: ServerLoadEvent) {
	event.depends('kotoba:topics');
	const params = parsePaginationParams(event.url);
	const level = event.url.searchParams.get('level') || undefined;
	const status = event.url.searchParams.get('status') || undefined;
	const sort = event.url.searchParams.get('sort') || undefined;
	return kotobaLoad(async () => {
		const result = await kotobaRepository.listPaginated(true, {
			...params,
			level,
			status,
			sort
		});
		return {
			topics: result.items.map(kotobaAdminTopic),
			meta: result.meta
		};
	});
}
