import type {
	UserProfileData,
	UpdateProfilePayload,
	ChangePasswordPayload,
	LinkGooglePayload,
	UnlinkGooglePayload,
	VerifyLinkGoogleCodePayload,
	VerifyLinkGoogleCodeResult
} from '../entities/user-profile.entity';
import type { AuthUser } from '$features/auth/domain/entities/auth.entity';

export interface UserProfileRepository {
	getProfile(): Promise<UserProfileData>;
	updateProfile(payload: UpdateProfilePayload): Promise<AuthUser>;
	changePassword(payload: ChangePasswordPayload): Promise<void>;
	requestLinkGoogleCode(): Promise<void>;
	verifyLinkGoogleCode(payload: VerifyLinkGoogleCodePayload): Promise<VerifyLinkGoogleCodeResult>;
	linkGoogle(payload: LinkGooglePayload): Promise<void>;
	unlinkGoogle(payload: UnlinkGooglePayload): Promise<void>;
	revokeOtherSessions(): Promise<void>;
}
