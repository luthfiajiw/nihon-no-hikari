import type { UserProfileRepository } from '../repositories/user-profile.repository';
import type { UserProfileData } from '../entities/user-profile.entity';

export class GetUserProfileUseCase {
	constructor(private readonly repo: UserProfileRepository) {}
	exec(): Promise<UserProfileData> {
		return this.repo.getProfile();
	}
}
