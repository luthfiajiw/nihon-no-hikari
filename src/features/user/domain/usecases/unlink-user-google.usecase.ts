import type { UserProfileRepository } from '../repositories/user-profile.repository';
import type { UnlinkGooglePayload } from '../entities/user-profile.entity';

export class UnlinkUserGoogleUseCase {
	constructor(private readonly repo: UserProfileRepository) {}
	exec(payload: UnlinkGooglePayload): Promise<void> {
		return this.repo.unlinkGoogle(payload);
	}
}
