import type { UserAdminRecord } from '../../domain/entities/user-admin.entity';
import type { AuthUser } from '$features/auth/domain/entities/auth.entity';
import type { PaginationMeta } from '$lib/models/pagination.model';

export type UserAdminData = {
	users: UserAdminRecord[];
	user?: AuthUser | null;
	meta?: PaginationMeta;
};
