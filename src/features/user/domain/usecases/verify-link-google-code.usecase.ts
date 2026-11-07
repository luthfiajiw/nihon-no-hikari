import type { UserProfileRepository } from '../repositories/user-profile.repository';
import type {
	VerifyLinkGoogleCodePayload,
	VerifyLinkGoogleCodeResult
} from '../entities/user-profile.entity';

export class VerifyLinkGoogleCodeUseCase {
	constructor(private readonly repo: UserProfileRepository) {}

	exec(payload: VerifyLinkGoogleCodePayload): Promise<VerifyLinkGoogleCodeResult> {
		return this.repo.verifyLinkGoogleCode(payload);
	}
}
