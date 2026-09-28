import type { AuthRepository } from '../repositories/auth.repository';
import type { SignInResponse, SignInRequest } from '../entities/auth.entity';

export class SignInUseCase {
	constructor(private readonly authRepository: AuthRepository) {}

	async exec(credentials: SignInRequest): Promise<SignInResponse> {
		return await this.authRepository.signIn(credentials);
	}
}
