import type {
	RefreshTokenRequest,
	SignInRequest,
	SignInResponse,
	SignOutRequest,
	StoredAuthSession
} from '../entities/auth.entity';

export interface AuthRepository {
	signIn(credentials: SignInRequest): Promise<SignInResponse>;
	refreshToken(
		payload: RefreshTokenRequest,
		currentSession: StoredAuthSession
	): Promise<StoredAuthSession>;
	signOut(payload: SignOutRequest): Promise<boolean>;
}
