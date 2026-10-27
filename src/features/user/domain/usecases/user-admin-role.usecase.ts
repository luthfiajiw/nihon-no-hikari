import { HttpError } from '$lib/http/http-error';
import { type UserAdminRole } from '$features/user/domain/entities/user-admin.entity';
import type { UserAdminRepository } from '../repositories/user-admin.repository';
export class ChangeUserAdminRoleUseCase {
	constructor(private readonly repository: UserAdminRepository) {}
	async exec(
		actor: { id: string; role?: string } | null | undefined,
		userId: string,
		role: UserAdminRole
	): Promise<void> {
		if (actor?.role !== 'Admin') throw new HttpError(403, 'Akses tidak diizinkan.');
		await this.repository.changeAdminRole(userId, role);
	}
}
