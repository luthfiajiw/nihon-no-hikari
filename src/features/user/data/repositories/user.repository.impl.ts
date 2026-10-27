import type { UserAdminRepository } from '../../domain/repositories/user-admin.repository';
import type { UserAdminRole, UserAdminRecord } from '../../domain/entities/user-admin.entity';
import { UserSource } from '../sources/user.source';
export class UserRepositoryImpl implements UserAdminRepository {
	constructor(private readonly adminSource: UserSource) {}
	getAdminUsers(): Promise<UserAdminRecord[]> {
		return this.adminSource.getAdminUsers();
	}
	changeAdminRole(userId: string, role: UserAdminRole): Promise<void> {
		return this.adminSource.changeAdminRole(userId, role);
	}
}
