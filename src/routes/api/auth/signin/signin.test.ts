import { describe, expect, it, vi } from 'vitest';
import { POST } from './+server';
import { POST as proxy } from '../../v1/[...path]/+server';
import { AuthSource } from '$features/auth/data/sources/auth.source';
import { AuthRepositoryImpl } from '$features/auth/data/repositories/auth.repository.impl';
import { SignInUseCase } from '$features/auth/domain/usecases/sign-in.usecase';
import * as validation from '$lib/server/validation';

vi.mock('$env/dynamic/private', () => ({ env: { API_BASE_URL: 'https://api.example.test/api/' } }));

vi.mock('$lib/server/auth-cookie', () => ({
	setAuthState: vi.fn(),
	toAuthState: vi.fn()
}));

function invoke(body: string, upstream: typeof globalThis.fetch) {
	const fetch: typeof globalThis.fetch = async (path, init) => {
		const url = new URL(String(path), 'https://app.example.test');
		return proxy({
			url,
			request: new Request(url, init),
			fetch: upstream
		} as Parameters<typeof proxy>[0]);
	};
	return POST({
		request: new Request('https://app.example.test/api/auth/signin', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		}),
		fetch,
		cookies: {}
	} as Parameters<typeof POST>[0]);
}

describe('sign-in request validation', () => {
	it('validates once across the usecase, source, sign-in handler and API proxy', async () => {
		const parse = vi.spyOn(validation, 'parseRequest');
		const upstream = vi
			.fn<typeof globalThis.fetch>()
			.mockResolvedValue(Response.json({ error: 'Credentials rejected' }, { status: 401 }));
		const fetch: typeof globalThis.fetch = async (_path, init) =>
			invoke(String(init?.body), upstream);
		const useCase = new SignInUseCase(new AuthRepositoryImpl(new AuthSource(fetch)));
		try {
			await expect(
				useCase.exec({ email: ' user@example.com ', password: 'password123' })
			).rejects.toThrow('Credentials rejected');
			expect(parse).toHaveBeenCalledOnce();
			expect(upstream).toHaveBeenCalledOnce();
			expect(
				JSON.parse(new TextDecoder().decode(upstream.mock.calls[0][1]?.body as ArrayBuffer))
			).toEqual({
				email: 'user@example.com',
				password: 'password123'
			});
		} finally {
			parse.mockRestore();
		}
	});

	it.each([
		'{',
		'null',
		'[]',
		JSON.stringify({ email: 'invalid', password: 'password123' }),
		JSON.stringify({ email: 42, password: 'password123' }),
		JSON.stringify({ email: 'user@example.com', password: 'short' })
	])('returns 400 for invalid input %# without sending credentials upstream', async (body) => {
		const fetch = vi.fn<typeof globalThis.fetch>();
		const response = await invoke(body, fetch);
		expect(response.status).toBe(400);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('normalizes email, preserves password whitespace and sends only credential fields', async () => {
		const fetch = vi
			.fn<typeof globalThis.fetch>()
			.mockResolvedValue(Response.json({ error: 'Credentials rejected' }, { status: 401 }));
		const response = await invoke(
			JSON.stringify({
				email: ' user@example.com ',
				password: ' password123 ',
				role: 'Admin'
			}),
			fetch
		);
		expect(response.status).toBe(401);
		expect(
			JSON.parse(new TextDecoder().decode(fetch.mock.calls[0][1]?.body as ArrayBuffer))
		).toEqual({
			email: 'user@example.com',
			password: ' password123 '
		});
	});
});
