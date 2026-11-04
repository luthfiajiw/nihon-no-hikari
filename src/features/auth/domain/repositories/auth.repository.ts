import type {
	GoogleSignInRequest,
	RefreshTokenRequest,
	RegisterRequest,
	RegisterResponse,
	SignInRequest,
	SignInResponse,
	SignOutRequest,
	StoredAuthSession
} from '../entities/auth.entity';

export interface AuthRepository {
	register(payload: RegisterRequest): Promise<RegisterResponse>;
	signIn(credentials: SignInRequest): Promise<SignInResponse>;
	googleSignIn(payload: GoogleSignInRequest): Promise<SignInResponse>;
	refreshToken(
		payload: RefreshTokenRequest,
		currentSession: StoredAuthSession
	): Promise<StoredAuthSession>;
	signOut(payload: SignOutRequest): Promise<boolean>;
}
