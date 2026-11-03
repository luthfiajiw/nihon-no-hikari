import type { AuthRepository } from '../repositories/auth.repository';
import type { RegisterRequest, RegisterResponse } from '../entities/auth.entity';

export class RegisterUseCase {
	constructor(private readonly authRepository: AuthRepository) {}

	async exec(payload: RegisterRequest): Promise<RegisterResponse> {
		return await this.authRepository.register(payload);
	}
}
