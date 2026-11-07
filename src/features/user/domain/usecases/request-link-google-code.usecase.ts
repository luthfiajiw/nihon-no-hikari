import type { UserProfileRepository } from '../repositories/user-profile.repository';

export class RequestLinkGoogleCodeUseCase {
	constructor(private readonly repo: UserProfileRepository) {}

	exec(): Promise<void> {
		return this.repo.requestLinkGoogleCode();
	}
}
