import { describe, expect, it, vi } from 'vitest';
import { GetUserProfileUseCase } from './get-user-profile.usecase';
import { UpdateUserProfileUseCase } from './update-user-profile.usecase';
import { ChangeUserPasswordUseCase } from './change-user-password.usecase';
import { LinkUserGoogleUseCase } from './link-user-google.usecase';
import { RequestLinkGoogleCodeUseCase } from './request-link-google-code.usecase';
import { VerifyLinkGoogleCodeUseCase } from './verify-link-google-code.usecase';
import { RevokeOtherSessionsUseCase } from './revoke-other-sessions.usecase';
import type { UserProfileData } from '../entities/user-profile.entity';
import type { AuthUser } from '$features/auth/domain/entities/auth.entity';

function mockRepo() {
	const mockProfile: UserProfileData = {
		id: 'u-1',
		email: 'test@example.com',
		display_name: 'Test User',
		avatar_url: 'https://example.com/avatar.png',
		role: 'User',
		has_password: true,
		google_linked: true,
		sessions: []
	};

	const mockUser: AuthUser = {
		id: 'u-1',
		email: 'test@example.com',
		display_name: 'Test User Updated',
		avatar_url: 'preset:kitsune',
		role: 'User'
	};

	return {
		getAdminUsers: vi.fn(),
		changeAdminRole: vi.fn(),
		getProfile: vi.fn().mockResolvedValue(mockProfile),
		updateProfile: vi.fn().mockResolvedValue(mockUser),
		changePassword: vi.fn().mockResolvedValue(undefined),
		requestLinkGoogleCode: vi.fn().mockResolvedValue(undefined),
		verifyLinkGoogleCode: vi.fn().mockResolvedValue({ verification_token: 'vt_abc' }),
		linkGoogle: vi.fn().mockResolvedValue(undefined),
		revokeOtherSessions: vi.fn().mockResolvedValue(undefined)
	};
}

describe('UserProfile UseCases', () => {
	it('GetUserProfileUseCase fetches profile from repository', async () => {
		const repo = mockRepo();
		const useCase = new GetUserProfileUseCase(repo);
		const profile = await useCase.exec();

		expect(repo.getProfile).toHaveBeenCalledOnce();
		expect(profile.display_name).toBe('Test User');
		expect(profile.google_linked).toBe(true);
	});

	it('UpdateUserProfileUseCase passes payload to repository and returns updated user', async () => {
		const repo = mockRepo();
		const useCase = new UpdateUserProfileUseCase(repo);
		const payload = { display_name: 'Test User Updated', avatar_url: 'preset:kitsune' };
		const result = await useCase.exec(payload);

		expect(repo.updateProfile).toHaveBeenCalledWith(payload);
		expect(result.display_name).toBe('Test User Updated');
		expect(result.avatar_url).toBe('preset:kitsune');
	});

	it('ChangeUserPasswordUseCase delegates password change to repository', async () => {
		const repo = mockRepo();
		const useCase = new ChangeUserPasswordUseCase(repo);
		const payload = {
			current_password: 'oldpassword',
			new_password: 'newpassword123',
			confirm_password: 'newpassword123'
		};
		await useCase.exec(payload);

		expect(repo.changePassword).toHaveBeenCalledWith(payload);
	});

	it('RequestLinkGoogleCodeUseCase delegates code request to repository', async () => {
		const repo = mockRepo();
		const useCase = new RequestLinkGoogleCodeUseCase(repo);
		await useCase.exec();

		expect(repo.requestLinkGoogleCode).toHaveBeenCalledOnce();
	});

	it('VerifyLinkGoogleCodeUseCase passes code payload to repository and returns result', async () => {
		const repo = mockRepo();
		const useCase = new VerifyLinkGoogleCodeUseCase(repo);
		const result = await useCase.exec({ code: '123456' });

		expect(repo.verifyLinkGoogleCode).toHaveBeenCalledWith({ code: '123456' });
		expect(result).toEqual({ verification_token: 'vt_abc' });
	});

	it('LinkUserGoogleUseCase delegates google token linking to repository', async () => {
		const repo = mockRepo();
		const useCase = new LinkUserGoogleUseCase(repo);
		await useCase.exec({ id_token: 'google-token-xyz', verification_token: 'vt_abc' });

		expect(repo.linkGoogle).toHaveBeenCalledWith({
			id_token: 'google-token-xyz',
			verification_token: 'vt_abc'
		});
	});

	it('RevokeOtherSessionsUseCase calls revoke on repository', async () => {
		const repo = mockRepo();
		const useCase = new RevokeOtherSessionsUseCase(repo);
		await useCase.exec();

		expect(repo.revokeOtherSessions).toHaveBeenCalledOnce();
	});
});
