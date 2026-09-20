import { describe, it, expect, vi } from 'vitest';
import { AuthApiService } from './auth-api.service';
import { HttpClient } from '$lib/http-client';

describe('AuthApiService', () => {
	it('should call httpClient.post with correct parameters and return response', async () => {
		const mockResponse = {
			status: 200,
			ok: true,
			data: {
				access_token: 'mock_token',
				token_type: 'Bearer',
				user: { id: 1, email: 'user@example.com', name: 'User' }
			},
			headers: new Headers(),
			response: {} as Response
		};

		const mockClient = {
			post: vi.fn().mockResolvedValue(mockResponse)
		} as unknown as HttpClient;

		const service = new AuthApiService(mockClient);

		const result = await service.signIn({
			email: 'user@example.com',
			password: 'password123'
		});

		expect(mockClient.post).toHaveBeenCalledWith(
			'/v1/signin',
			{
				email: 'user@example.com',
				password: 'password123'
			},
			{
				headers: { Accept: 'application/json' }
			}
		);

		expect(result).toEqual({
			status: 200,
			data: mockResponse.data
		});
	});
});
