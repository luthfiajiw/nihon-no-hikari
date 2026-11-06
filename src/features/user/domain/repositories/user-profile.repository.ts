import type {
	UserProfileData,
	UpdateProfilePayload,
	ChangePasswordPayload,
	LinkGooglePayload
} from '../entities/user-profile.entity';
import type { AuthUser } from '$features/auth/domain/entities/auth.entity';

export interface UserProfileRepository {
	getProfile(): Promise<UserProfileData>;
	updateProfile(payload: UpdateProfilePayload): Promise<AuthUser>;
	changePassword(payload: ChangePasswordPayload): Promise<void>;
	linkGoogle(payload: LinkGooglePayload): Promise<void>;
	revokeOtherSessions(): Promise<void>;
}
