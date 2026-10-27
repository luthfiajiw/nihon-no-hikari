import type { UserAdminRecord } from '../../domain/entities/user-admin.entity';
import type { AuthUser } from '$features/auth/domain/entities/auth.entity';
export type UserAdminData = { users: UserAdminRecord[]; user?: AuthUser | null };
