import type { UserProfileRepository } from '../repositories/user-profile.repository';
import type { UpdateProfilePayload } from '../entities/user-profile.entity';
import type { AuthUser } from '$features/auth/domain/entities/auth.entity';

export class UpdateUserProfileUseCase {
	constructor(private readonly repo: UserProfileRepository) {}
	exec(payload: UpdateProfilePayload): Promise<AuthUser> {
		return this.repo.updateProfile(payload);
	}
}
