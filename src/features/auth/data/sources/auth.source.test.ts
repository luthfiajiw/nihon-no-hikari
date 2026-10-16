import { describe, expect, it, vi } from 'vitest';
import { InvalidCredentialsError, SignInNetworkError } from '../../domain/entities/auth.entity';
import { AuthSource } from './auth.source';

describe('AuthSource', () => {
	it('handles a non-JSON gateway failure as a domain network error', async () => {
		const fetch = vi
			.fn<typeof globalThis.fetch>()
			.mockResolvedValue(new Response('Bad gateway', { status: 502 }));
		await expect(
			new AuthSource(fetch).signIn({ email: 'user@example.test', password: 'password' })
		).rejects.toBeInstanceOf(SignInNetworkError);
	});
	const credentials = {
		email: 'user@example.com',
		password: 'password123'
	};

	it('calls the SvelteKit sign-in endpoint and returns its DTO', async () => {
		const responseData = {
			success: true,
			message: 'Sign in berhasil.',
			data: {
				id: 'user-1',
				email: 'user@example.com',
				display_name: 'User',
				role: 'User',
				session: {
					id: 'session-1',
					access_token: 'access-token',
					access_token_expires_at: '2099-10-02T11:00:00.000Z',
					refresh_token: 'refresh-token',
					refresh_token_expires_at: '2099-10-09T11:00:00.000Z'
				}
			}
		};
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(responseData), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		const service = new AuthSource(mockFetch);

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
			const service = new AuthSource(mockFetch);
			const result = service.signIn(credentials);

			await expect(result).rejects.toBeInstanceOf(InvalidCredentialsError);
			await expect(result).rejects.toThrow(errorMessage);
			expect(mockFetch).toHaveBeenCalledOnce();
		}
	);

	it('does not report an upstream routing error as invalid credentials', async () => {
		const errorMessage = 'Endpoint signin tidak ditemukan di server autentikasi.';
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ error: errorMessage }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			})
		);
		const service = new AuthSource(mockFetch);

		const result = service.signIn(credentials);

		await expect(result).rejects.toBeInstanceOf(SignInNetworkError);
		await expect(result).rejects.toThrow(errorMessage);
	});
});
