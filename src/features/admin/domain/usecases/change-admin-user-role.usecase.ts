import { AdminError } from '../entities/admin.entity';
import type { AdminRepository } from '../repositories/admin.repository';
export class ChangeAdminUserRoleUseCase {
	constructor(private readonly repository: AdminRepository) {}
	async exec(
		actor: { id: string; role?: string } | null | undefined,
		userId: unknown,
		role: unknown
	): Promise<void> {
		if (actor?.role !== 'Admin') throw new AdminError(403, 'Akses tidak diizinkan.');
		if (
			typeof userId !== 'string' ||
			!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) ||
			(role !== 'User' && role !== 'Admin')
		)
			throw new AdminError(400, 'Data perubahan role tidak valid.');
		await this.repository.changeRole(userId, role);
	}
}
