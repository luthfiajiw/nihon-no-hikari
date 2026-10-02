import type { AuthRepository } from '../repositories/auth.repository';
import type { StoredAuthSession } from '../entities/auth.entity';

export class RefreshTokenUseCase {
	constructor(private readonly authRepository: AuthRepository) {}

	exec(currentSession: StoredAuthSession): Promise<StoredAuthSession> {
		return this.authRepository.refreshToken(
			{
				grant_type: 'refresh',
				token: currentSession.refreshToken
			},
			currentSession
		);
	}
}
