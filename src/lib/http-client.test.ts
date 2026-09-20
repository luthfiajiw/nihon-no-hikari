import { describe, it, expect, vi } from 'vitest';
import { HttpClient } from './http-client';

describe('HttpClient', () => {
	it('should make a GET request with query params', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			status: 200,
			ok: true,
			headers: new Headers({ 'content-type': 'application/json' }),
			json: async () => ({ message: 'success' })
		});

		const client = new HttpClient({ fetch: mockFetch });

		const res = await client.get<{ message: string }>('/users', {
			params: { page: 1, limit: 10 }
		});

		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8000/api/users?page=1&limit=10',
			expect.objectContaining({ method: 'GET' })
		);
		expect(res.status).toBe(200);
		expect(res.data).toEqual({ message: 'success' });
	});

	it('should execute onRequest interceptors', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			status: 200,
			ok: true,
			headers: new Headers({ 'content-type': 'application/json' }),
			json: async () => ({ ok: true })
		});

		const client = new HttpClient({ fetch: mockFetch });

		client.onRequest((config) => {
			return {
				...config,
				headers: {
					...config.headers,
					Authorization: 'Bearer test-token'
				}
			};
		});

		await client.post('/items', { title: 'Test' });

		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:8000/api/items',
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					Authorization: 'Bearer test-token',
					'Content-Type': 'application/json'
				})
			})
		);
	});

	it('should execute onResponse interceptors', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			status: 200,
			ok: true,
			headers: new Headers({ 'content-type': 'application/json' }),
			json: async () => ({ status: 'original' })
		});

		const client = new HttpClient({ fetch: mockFetch });
		const interceptorSpy = vi.fn((response) => response);

		client.onResponse(interceptorSpy);

		await client.get('https://api.example.com/data');

		expect(interceptorSpy).toHaveBeenCalled();
	});

	it('should allow unregistering onRequest interceptors', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			status: 200,
			ok: true,
			headers: new Headers({ 'content-type': 'application/json' }),
			json: async () => ({ ok: true })
		});

		const client = new HttpClient({ fetch: mockFetch });

		const remove = client.onRequest((config) => ({
			...config,
			headers: { ...config.headers, 'X-Custom': '123' }
		}));

		remove(); // Unregister interceptor

		await client.get('https://api.example.com/test');

		expect(mockFetch).toHaveBeenCalledWith(
			'https://api.example.com/test',
			expect.objectContaining({
				headers: expect.not.objectContaining({ 'X-Custom': '123' })
			})
		);
	});

	it('should execute onError interceptor when fetch fails', async () => {
		const mockError = new Error('Network error');
		const mockFetch = vi.fn().mockRejectedValue(mockError);

		const client = new HttpClient({ fetch: mockFetch });
		const errorHandler = vi.fn((err) => {
			throw new Error(`Handled: ${(err as Error).message}`);
		});

		client.onError(errorHandler);

		await expect(client.get('https://api.example.com/error')).rejects.toThrow(
			'Handled: Network error'
		);
		expect(errorHandler).toHaveBeenCalled();
	});

	it('should support PUT, PATCH, and DELETE helpers', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			status: 204,
			ok: true,
			headers: new Headers(),
			text: async () => ''
		});

		const client = new HttpClient({ fetch: mockFetch });

		await client.put('https://api.example.com/1', { name: 'Updated' });
		expect(mockFetch).toHaveBeenLastCalledWith(
			'https://api.example.com/1',
			expect.objectContaining({ method: 'PUT' })
		);

		await client.patch('https://api.example.com/1', { name: 'Patched' });
		expect(mockFetch).toHaveBeenLastCalledWith(
			'https://api.example.com/1',
			expect.objectContaining({ method: 'PATCH' })
		);

		await client.delete('https://api.example.com/1');
		expect(mockFetch).toHaveBeenLastCalledWith(
			'https://api.example.com/1',
			expect.objectContaining({ method: 'DELETE' })
		);
	});
});
