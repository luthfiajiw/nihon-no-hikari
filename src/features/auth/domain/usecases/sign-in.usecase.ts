import type { AuthRepository } from '../repositories/auth.repository';
import { DomainError, type SignInResponse, type SignInRequest } from '../entities/auth.entity';

export class SignInUseCase {
	constructor(private readonly authRepository: AuthRepository) {}

	async exec(credentials: SignInRequest): Promise<SignInResponse> {
		const email = credentials.email.trim();
		if (!email) throw new DomainError('Email wajib diisi.');
		if (!credentials.password) throw new DomainError('Password wajib diisi.');

		return await this.authRepository.signIn({
			email,
			password: credentials.password
		});
	}
}
