import { getUserAdminListUseCase } from '$dependencies/user.dependency';
import { managementLoad } from '$lib/server/management-load';
import { parsePaginationParams } from '$lib/models/pagination.model';
import type { ServerLoadEvent } from '@sveltejs/kit';

export async function loadUserAdminList(event?: ServerLoadEvent) {
	event?.depends('user:admin-list');
	const params = event?.url ? parsePaginationParams(event.url) : undefined;
	const role = event?.url?.searchParams.get('role') || undefined;
	const result = await managementLoad(() => getUserAdminListUseCase.exec({ ...params, role }));
	return {
		users: result.items,
		meta: result.meta
	};
}
