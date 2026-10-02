import type { AuthRepository } from '../repositories/auth.repository';

export class SignOutUseCase {
	constructor(private readonly authRepository: AuthRepository) {}

	exec(sessionId: string): Promise<boolean> {
		return this.authRepository.signOut({ session_id: sessionId });
	}
}
