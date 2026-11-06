import type { UserProfileRepository } from '../repositories/user-profile.repository';

export class RevokeOtherSessionsUseCase {
	constructor(private readonly repo: UserProfileRepository) {}
	exec(): Promise<void> {
		return this.repo.revokeOtherSessions();
	}
}
