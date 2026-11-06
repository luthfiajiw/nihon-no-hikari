import type { UserProfileRepository } from '../repositories/user-profile.repository';
import type { ChangePasswordPayload } from '../entities/user-profile.entity';

export class ChangeUserPasswordUseCase {
	constructor(private readonly repo: UserProfileRepository) {}
	exec(payload: ChangePasswordPayload): Promise<void> {
		return this.repo.changePassword(payload);
	}
}
