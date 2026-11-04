import { describe, it, expect, vi } from 'vitest';
import { GoogleSignInUseCase } from './google-sign-in.usecase';
import type { AuthRepository } from '../repositories/auth.repository';
import { InvalidCredentialsError } from '../entities/auth.entity';

function createMockRepository(googleSignIn = vi.fn()): AuthRepository {
	return {
		register: vi.fn(),
		signIn: vi.fn(),
		googleSignIn,
		refreshToken: vi.fn(),
		signOut: vi.fn()
	};
}

describe('GoogleSignInUseCase', () => {
	it('forwards the Google ID token to the repository', async () => {
		const result = { success: true, message: 'ok', data: { id: '1' } };
		const repo = createMockRepository(vi.fn().mockResolvedValue(result));

		await expect(new GoogleSignInUseCase(repo).exec({ idToken: 'tok' })).resolves.toEqual(result);
		expect(repo.googleSignIn).toHaveBeenCalledWith({ idToken: 'tok' });
	});

	it('propagates repository errors', async () => {
		const repo = createMockRepository(vi.fn().mockRejectedValue(new InvalidCredentialsError()));

		await expect(new GoogleSignInUseCase(repo).exec({ idToken: 'bad' })).rejects.toThrow(
			InvalidCredentialsError
		);
	});
});
