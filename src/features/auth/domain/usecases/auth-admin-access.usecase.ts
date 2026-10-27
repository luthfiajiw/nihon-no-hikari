import type { AuthAdminRepository } from '../repositories/auth-admin.repository';
export class CheckAuthAdminAccessUseCase {
	constructor(private readonly repository: AuthAdminRepository) {}
	exec(): Promise<void> {
		return this.repository.checkAdminAccess();
	}
}
