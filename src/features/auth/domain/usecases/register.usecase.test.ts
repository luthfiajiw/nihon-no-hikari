import { describe, it, expect, vi } from 'vitest';
import { RegisterUseCase } from './register.usecase';
import type { AuthRepository } from '../repositories/auth.repository';
import { RegisterError } from '../entities/auth.entity';

describe('RegisterUseCase', () => {
	function createMockRepository(register = vi.fn()): AuthRepository {
		return {
			register,
			signIn: vi.fn(),
			refreshToken: vi.fn(),
			signOut: vi.fn()
		};
	}

	it('forwards registration payload to the repository', async () => {
		const mockResponse = {
			success: true,
			message: 'akun baru berhasil dibuat'
		};

		const mockRepo = createMockRepository(vi.fn().mockResolvedValue(mockResponse));
		const useCase = new RegisterUseCase(mockRepo);

		const payload = {
			display_name: 'Test User',
			email: 'test@example.com',
			password: 'password123',
			confirm_password: 'password123'
		};

		const result = await useCase.exec(payload);

		expect(mockRepo.register).toHaveBeenCalledWith(payload);
		expect(result).toEqual(mockResponse);
	});

	it('propagates errors thrown by the repository', async () => {
		const mockRepo = createMockRepository(
			vi.fn().mockRejectedValue(new RegisterError('email sudah terdaftar'))
		);
		const useCase = new RegisterUseCase(mockRepo);

		await expect(
			useCase.exec({
				display_name: 'Test User',
				email: 'taken@example.com',
				password: 'password123',
				confirm_password: 'password123'
			})
		).rejects.toThrow('email sudah terdaftar');
	});
});
