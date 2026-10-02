import { describe, it, expect, vi } from 'vitest';
import { SignInUseCase } from './sign-in.usecase';
import type { AuthRepository } from '../repositories/auth.repository';
import { DomainError, InvalidCredentialsError } from '../entities/auth.entity';

describe('SignInUseCase', () => {
	function createMockRepository(signIn = vi.fn()): AuthRepository {
		return {
			signIn,
			refreshToken: vi.fn(),
			signOut: vi.fn()
		};
	}

	it('should throw DomainError if email is empty', async () => {
		const mockRepo = createMockRepository();
		const useCase = new SignInUseCase(mockRepo);

		await expect(useCase.exec({ email: '', password: 'password123' })).rejects.toThrow(DomainError);
		expect(mockRepo.signIn).not.toHaveBeenCalled();
	});

	it('should throw DomainError if password is empty', async () => {
		const mockRepo = createMockRepository();
		const useCase = new SignInUseCase(mockRepo);

		await expect(useCase.exec({ email: 'test@example.com', password: '' })).rejects.toThrow(
			DomainError
		);
		expect(mockRepo.signIn).not.toHaveBeenCalled();
	});

	it('should trim email and call authRepository.signIn with correct payload', async () => {
		const mockAuthResult = {
			success: true,
			message: 'Sign in berhasil.',
			data: {
				id: '1',
				email: 'test@example.com',
				display_name: 'Test User',
				session: {
					id: 'session-1',
					access_token: 'access-token',
					access_token_expires_at: '2099-10-02T11:00:00.000Z',
					refresh_token: 'refresh-token',
					refresh_token_expires_at: '2099-10-09T11:00:00.000Z'
				}
			}
		};

		const mockRepo = createMockRepository(vi.fn().mockResolvedValue(mockAuthResult));
		const useCase = new SignInUseCase(mockRepo);

		const result = await useCase.exec({
			email: '  test@example.com  ',
			password: 'secretpassword'
		});

		expect(mockRepo.signIn).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'secretpassword'
		});
		expect(result).toEqual(mockAuthResult);
	});

	it('should propagate InvalidCredentialsError thrown by repository', async () => {
		const mockRepo = createMockRepository(vi.fn().mockRejectedValue(new InvalidCredentialsError()));
		const useCase = new SignInUseCase(mockRepo);

		await expect(
			useCase.exec({ email: 'test@example.com', password: 'wrongpassword' })
		).rejects.toThrow(InvalidCredentialsError);
	});
});
