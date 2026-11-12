import type { UserAdminRepository } from '../../domain/repositories/user-admin.repository';
import type { UserProfileRepository } from '../../domain/repositories/user-profile.repository';
import type { UserAdminRole, UserAdminRecord } from '../../domain/entities/user-admin.entity';
import type { PaginatedResult, PaginationQueryOptions } from '$lib/models/pagination.model';
import type {
	UserProfileData,
	UpdateProfilePayload,
	ChangePasswordPayload,
	LinkGooglePayload,
	UnlinkGooglePayload,
	VerifyLinkGoogleCodePayload,
	VerifyLinkGoogleCodeResult
} from '../../domain/entities/user-profile.entity';
import type { AuthUser } from '$features/auth/domain/entities/auth.entity';
import { UserSource } from '../sources/user.source';

export class UserRepositoryImpl implements UserAdminRepository, UserProfileRepository {
	constructor(private readonly userSource: UserSource) {}

	getAdminUsers(
		options?: PaginationQueryOptions & { role?: string }
	): Promise<PaginatedResult<UserAdminRecord>> {
		return this.userSource.getAdminUsers(options);
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

	requestLinkGoogleCode(): Promise<void> {
		return this.userSource.requestLinkGoogleCode();
	}

	verifyLinkGoogleCode(
		payload: VerifyLinkGoogleCodePayload
	): Promise<VerifyLinkGoogleCodeResult> {
		return this.userSource.verifyLinkGoogleCode(payload);
	}

	linkGoogle(payload: LinkGooglePayload): Promise<void> {
		return this.userSource.linkGoogle(payload);
	}

	unlinkGoogle(payload: UnlinkGooglePayload): Promise<void> {
		return this.userSource.unlinkGoogle(payload);
	}

	revokeOtherSessions(): Promise<void> {
		return this.userSource.revokeOtherSessions();
	}
}
