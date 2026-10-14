import type { AdminRepository } from '../repositories/admin.repository';
export class GetAdminUsersUseCase {
	constructor(private readonly repository: AdminRepository) {}
	exec() {
		return this.repository.getUsers();
	}
}
