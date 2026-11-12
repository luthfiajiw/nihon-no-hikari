import type { UserAdminRepository } from '../repositories/user-admin.repository';
import type { PaginationQueryOptions } from '$lib/models/pagination.model';

export class GetUserAdminListUseCase {
	constructor(private readonly repository: UserAdminRepository) {}
	exec(options?: PaginationQueryOptions & { role?: string }) {
		return this.repository.getAdminUsers(options);
	}
}
