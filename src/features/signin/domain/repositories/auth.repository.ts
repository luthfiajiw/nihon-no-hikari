import type { SignInRequest, SignInResponse } from "../entities/auth.entity";

export interface AuthRepository {
	signIn(credentials: SignInRequest): Promise<SignInResponse>;
}
