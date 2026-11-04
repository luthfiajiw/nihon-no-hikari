import type { AuthRepository } from '../repositories/auth.repository';
import type { GoogleSignInRequest, SignInResponse } from '../entities/auth.entity';

export class GoogleSignInUseCase {
	constructor(private readonly authRepository: AuthRepository) {}

	async exec(payload: GoogleSignInRequest): Promise<SignInResponse> {
		return await this.authRepository.googleSignIn(payload);
	}
}
