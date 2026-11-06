import type { UserProfileRepository } from '../repositories/user-profile.repository';
import type { LinkGooglePayload } from '../entities/user-profile.entity';

export class LinkUserGoogleUseCase {
	constructor(private readonly repo: UserProfileRepository) {}
	exec(payload: LinkGooglePayload): Promise<void> {
		return this.repo.linkGoogle(payload);
	}
}
