import { AdminError, type AdminUserRole } from '../entities/admin.entity';
import type { AdminRepository } from '../repositories/admin.repository';
export class ChangeAdminUserRoleUseCase {
	constructor(private readonly repository: AdminRepository) {}
	async exec(
		actor: { id: string; role?: string } | null | undefined,
		userId: string,
		role: AdminUserRole
	): Promise<void> {
		if (actor?.role !== 'Admin') throw new AdminError(403, 'Akses tidak diizinkan.');
		await this.repository.changeRole(userId, role);
	}
}
