import { describe, it, expect, vi } from 'vitest';
import { SignInUseCase } from './sign-in.usecase';
import type { AuthRepository } from '../repositories/auth.repository';
import { DomainError, InvalidCredentialsError } from '../entities/auth.entity';

describe('SignInUseCase', () => {
	it('should throw DomainError if email is empty', async () => {
		const mockRepo: AuthRepository = { signIn: vi.fn() };
		const useCase = new SignInUseCase(mockRepo);

		await expect(useCase.execute({ email: '', password: 'password123' })).rejects.toThrow(
			DomainError
		);
		expect(mockRepo.signIn).not.toHaveBeenCalled();
	});

	it('should throw DomainError if password is empty', async () => {
		const mockRepo: AuthRepository = { signIn: vi.fn() };
		const useCase = new SignInUseCase(mockRepo);

		await expect(useCase.execute({ email: 'test@example.com', password: '' })).rejects.toThrow(
			DomainError
		);
		expect(mockRepo.signIn).not.toHaveBeenCalled();
	});

	it('should trim email and call authRepository.signIn with correct payload', async () => {
		const mockAuthResult = {
			accessToken: 'jwt_token_123',
			tokenType: 'Bearer',
			user: { id: '1', email: 'test@example.com', name: 'Test User' }
		};

		const mockRepo: AuthRepository = {
			signIn: vi.fn().mockResolvedValue(mockAuthResult)
		};
		const useCase = new SignInUseCase(mockRepo);

		const result = await useCase.execute({
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
		const mockRepo: AuthRepository = {
			signIn: vi.fn().mockRejectedValue(new InvalidCredentialsError())
		};
		const useCase = new SignInUseCase(mockRepo);

		await expect(
			useCase.execute({ email: 'test@example.com', password: 'wrongpassword' })
		).rejects.toThrow(InvalidCredentialsError);
	});
});
