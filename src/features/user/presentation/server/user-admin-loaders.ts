import { getUserAdminListUseCase } from '$dependencies/user.dependency';
import { managementLoad } from '$lib/server/management-load';
export async function loadUserAdminList() {
	return { users: await managementLoad(() => getUserAdminListUseCase.exec()) };
}
