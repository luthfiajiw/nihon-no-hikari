import type { UserAdminRepository } from '../repositories/user-admin.repository';
export class GetUserAdminListUseCase {
	constructor(private readonly repository: UserAdminRepository) {}
	exec() {
		return this.repository.getAdminUsers();
	}
}
