import { describe, expect, it, vi } from 'vitest';
import { HttpClient } from '$lib/http-client';
import { InvalidCredentialsError } from '../../domain/entities/auth.entity';
import { AuthSource } from './auth.source';

describe('AuthSource', () => {
	const credentials = {
		email: 'user@example.com',
		password: 'password123'
	};

	it('calls the Better Auth sign-in endpoint and returns its DTO on success', async () => {
		const responseData = {
			success: true,
			message: 'Sign in berhasil.',
			data: {
				id: 'user-1',
				email: 'user@example.com',
				display_name: 'User'
			}
		};
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(responseData), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		const service = new AuthSource(new HttpClient({ fetch: mockFetch, baseUrl: '' }));

		const result = await service.signIn(credentials);

		expect(mockFetch).toHaveBeenCalledWith('/api/auth/signin', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(credentials)
		});

		expect(result).toEqual(responseData);
	});

	it.each([400, 401])(
		'throws InvalidCredentialsError with the response message on status %i',
		async (status) => {
			const errorMessage = 'Email atau password salah.';
			const mockFetch = vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ error: errorMessage }), {
					status,
					headers: { 'Content-Type': 'application/json' }
				})
			);
			const service = new AuthSource(new HttpClient({ fetch: mockFetch, baseUrl: '' }));
			const result = service.signIn(credentials);

			await expect(result).rejects.toBeInstanceOf(InvalidCredentialsError);
			await expect(result).rejects.toThrow(errorMessage);
			expect(mockFetch).toHaveBeenCalledOnce();
		}
	);
});
