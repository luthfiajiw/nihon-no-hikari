import type { RequestEvent } from '@sveltejs/kit';
import { managementActionFailure } from '$lib/server/management-action';
import { changeUserAdminRoleUseCase } from '$dependencies/user.dependency';
import type { UserAdminRole } from '../../domain/entities/user-admin.entity';
export async function changeUserAdminRole(event: RequestEvent) {
	try {
		const form = await event.request.formData();
		await changeUserAdminRoleUseCase.exec(
			event.locals.user,
			String(form.get('userId') ?? ''),
			form.get('role') as UserAdminRole
		);
		return { message: 'Role pengguna berhasil diperbarui.' };
	} catch (cause) {
		return managementActionFailure(cause);
	}
}
