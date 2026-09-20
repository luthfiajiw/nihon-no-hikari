import type { AuthRepository } from '../repositories/auth.repository';
import type { AuthResponse, SignInForm } from '../entities/auth.entity';
import { DomainError } from '../entities/auth.entity';

export class SignInUseCase {
	constructor(private readonly authRepository: AuthRepository) {}

	async execute(credentials: SignInForm): Promise<AuthResponse> {
		const trimmedEmail = credentials.email?.trim();
		const password = credentials.password;

		if (!trimmedEmail) {
			throw new DomainError('Email wajib diisi.');
		}

		if (!password) {
			throw new DomainError('Password wajib diisi.');
		}

		return await this.authRepository.signIn({
			email: trimmedEmail,
			password
		});
	}
}
