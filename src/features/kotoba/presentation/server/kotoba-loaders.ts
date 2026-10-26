import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { kotobaRepository } from '$dependencies/kotoba.dependency';
import { KotobaError } from '../../domain/entities/kotoba-api.entity';
import { topicDetail } from '../models/kotoba-api.model';
import { adminTopic } from '$features/admin/presentation/models/admin-kotoba-api.model';
import { emptyTopic } from '$features/admin/presentation/models/admin-kotoba.model';

export async function kotobaLoad<T>(operation: () => Promise<T>): Promise<T> {
	try {
		return await operation();
	} catch (cause) {
		if (!(cause instanceof KotobaError)) throw cause;
		if (cause.status === 401) redirect(303, resolve('/signin'));
		if (cause.status === 403) redirect(303, resolve('/'));
		error(cause.status, cause.message);
	}
}
export async function loadKotobaEditor(id: string) {
	return kotobaLoad(async () => {
		if (id !== 'new') return { topic: adminTopic(await kotobaRepository.detail(id, true)) };
		const records = await kotobaRepository.list(true);
		return { topic: emptyTopic(Math.max(0, ...records.map((item) => item.order_index)) + 1) };
	});
}
export async function loadKotobaDetail(id: string) {
	return kotobaLoad(async () => ({ topic: topicDetail(await kotobaRepository.detail(id, false)) }));
}
