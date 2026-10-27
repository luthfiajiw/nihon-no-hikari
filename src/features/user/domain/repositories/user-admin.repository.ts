import type { UserAdminRole, UserAdminRecord } from '../entities/user-admin.entity';
export interface UserAdminRepository {
	getAdminUsers(): Promise<UserAdminRecord[]>;
	changeAdminRole(userId: string, role: UserAdminRole): Promise<void>;
}
