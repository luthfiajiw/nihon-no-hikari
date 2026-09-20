import type { AuthResponse, SignInForm } from '../entities/auth.entity';

export interface AuthRepository {
	signIn(credentials: SignInForm): Promise<AuthResponse>;
}
