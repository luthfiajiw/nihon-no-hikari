import type { UserAdminRepository } from '../../domain/repositories/user-admin.repository';
import type { UserProfileRepository } from '../../domain/repositories/user-profile.repository';
import type { UserAdminRole, UserAdminRecord } from '../../domain/entities/user-admin.entity';
import type {
	UserProfileData,
	UpdateProfilePayload,
	ChangePasswordPayload,
	LinkGooglePayload
} from '../../domain/entities/user-profile.entity';
import type { AuthUser } from '$features/auth/domain/entities/auth.entity';
import { UserSource } from '../sources/user.source';

export class UserRepositoryImpl implements UserAdminRepository, UserProfileRepository {
	constructor(private readonly userSource: UserSource) {}

	getAdminUsers(): Promise<UserAdminRecord[]> {
		return this.userSource.getAdminUsers();
	}

	changeAdminRole(userId: string, role: UserAdminRole): Promise<void> {
		return this.userSource.changeAdminRole(userId, role);
	}

	getProfile(): Promise<UserProfileData> {
		return this.userSource.getProfile();
	}

	updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
		return this.userSource.updateProfile(payload);
	}

	changePassword(payload: ChangePasswordPayload): Promise<void> {
		return this.userSource.changePassword(payload);
	}

	linkGoogle(payload: LinkGooglePayload): Promise<void> {
		return this.userSource.linkGoogle(payload);
	}

	revokeOtherSessions(): Promise<void> {
		return this.userSource.revokeOtherSessions();
	}
}
