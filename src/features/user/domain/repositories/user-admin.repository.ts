import type { UserAdminRole, UserAdminRecord } from '../entities/user-admin.entity';
import type { PaginatedResult, PaginationQueryOptions } from '$lib/models/pagination.model';

export interface UserAdminRepository {
	getAdminUsers(options?: PaginationQueryOptions & { role?: string }): Promise<PaginatedResult<UserAdminRecord>>;
	changeAdminRole(userId: string, role: UserAdminRole): Promise<void>;
}
