import type { AdminRepository } from '../repositories/admin.repository';
export class CheckAdminAccessUseCase {
	constructor(private readonly repository: AdminRepository) {}
	exec(): Promise<void> {
		return this.repository.checkAccess();
	}
}
