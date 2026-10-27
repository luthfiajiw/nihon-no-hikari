import { checkAuthAdminAccessUseCase } from '$dependencies/auth.dependency';
import { managementLoad } from '$lib/server/management-load';
export function loadAuthAdminAccess() {
	return managementLoad(() => checkAuthAdminAccessUseCase.exec());
}
