import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import type { AuthState } from '$features/auth/domain/entities/auth.entity';

vi.mock('$app/environment', () => ({ dev: true }));
vi.mock('$env/dynamic/private', () => ({
	env: {
		API_BASE_URL: 'https://api.example.test/api',
		AUTH_SECRET: 'test-cookie-secret'
	}
}));
vi.mock('$lib/paraglide/runtime', () => ({ getTextDirection: () => 'ltr' }));
vi.mock('$lib/paraglide/server', () => ({ paraglideMiddleware: vi.fn() }));

import { handleFetch as fetchWithAuth } from './hooks.server';
import { withRequestEvent } from '$lib/server/request-event.test-utils';

const handleFetch: typeof fetchWithAuth = (input) =>
	withRequestEvent(input.event, () => fetchWithAuth(input));
import { readAuthState } from '$lib/server/auth-cookie';

function createEvent(token = 'access-token', expired = false) {
	const state: AuthState = {
		user: { id: token, email: 'user@example.test', display_name: 'User', role: 'User' },
		session: {
			id: token,
			accessToken: token,
			refreshToken: `refresh-${token}`,
			accessTokenExpiresAt: expired ? '2000-01-01T00:00:00Z' : '2099-01-01T00:00:00Z',
			refreshTokenExpiresAt: '2099-02-01T00:00:00Z'
		}
	};
	const values = new Map<string, string>();
	const cookies = {
		get: vi.fn((name: string) => values.get(name)),
		getAll: vi.fn(() => [...values].map(([name, value]) => ({ name, value }))),
		set: vi.fn((name: string, value: string) => values.set(name, value)),
		delete: vi.fn((name: string) => values.delete(name))
	};
	const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async () =>
		Response.json({
			data: {
				access_token: 'rotated',
				access_token_expires_at: '2099-01-01T00:00:00Z',
				refresh_token: 'rotated-refresh',
				refresh_token_expires_at: '2099-02-01T00:00:00Z'
			}
		})
	);
	const event = { cookies, fetch, locals: state } as unknown as RequestEvent;
	return { event, cookies, fetch };
}

const apiRequest = (path = '/courses', init?: RequestInit) =>
	new Request(`https://api.example.test/api/v1${path}`, init);

describe('API handleFetch', () => {
	beforeEach(() => vi.clearAllMocks());

	it('uses only the session bearer and omits app cookies', async () => {
		const { event } = createEvent();
		const fetch = vi
			.fn<typeof globalThis.fetch>()
			.mockResolvedValue(Response.json({ success: true }));
		await handleFetch({
			event,
			request: apiRequest('/courses', {
				headers: {
					authorization: 'Bearer spoofed',
					cookie: 'nnh.auth=private'
				}
			}),
			fetch
		});
		const sent = fetch.mock.calls[0][0] as Request;
		expect(sent.headers.get('authorization')).toBe('Bearer access-token');
		expect(sent.headers.has('cookie')).toBe(false);
		expect(sent.credentials).toBe('omit');
	});

	it.each([
		'https://third.example.test/api/v1/courses',
		'https://api.example.test.evil/api/v1/courses',
		'https://api.example.test/api-other/v1/courses',
		'https://api.example.test/assets/image.png'
	])('does not attach credentials to %s', async (url) => {
		const { event } = createEvent();
		const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response());
		const request = new Request(url);
		await handleFetch({ event, request, fetch });
		expect(fetch.mock.calls[0][0]).toBe(request);
		expect(request.headers.has('authorization')).toBe(false);
	});

	it.each(['register', 'signin', 'token', 'signout'])(
		'bypasses bearer and refresh for auth/%s',
		async (name) => {
			const { event, fetch: refresh } = createEvent('expired', true);
			const fetch = vi
				.fn<typeof globalThis.fetch>()
				.mockResolvedValue(new Response(null, { status: 401 }));
			await handleFetch({ event, request: apiRequest(`/auth/${name}`, { method: 'POST' }), fetch });
			expect(fetch).toHaveBeenCalledOnce();
			expect((fetch.mock.calls[0][0] as Request).headers.has('authorization')).toBe(false);
			expect(refresh).not.toHaveBeenCalled();
		}
	);

	it('returns 401 without contacting the backend for an anonymous request', async () => {
		const { event } = createEvent();
		event.locals = { user: null, session: null };
		const fetch = vi.fn<typeof globalThis.fetch>();
		const response = await handleFetch({ event, request: apiRequest(), fetch });
		expect(response.status).toBe(401);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('refreshes expired sessions through the local proxy and updates the auth cookie', async () => {
		const { event, fetch: refresh } = createEvent('expired', true);
		const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response());
		await handleFetch({ event, request: apiRequest(), fetch });
		expect(refresh).toHaveBeenCalledWith(
			'/api/v1/auth/token',
			expect.objectContaining({
				body: JSON.stringify({ grant_type: 'refresh', token: 'refresh-expired' })
			})
		);
		expect((fetch.mock.calls[0][0] as Request).headers.get('authorization')).toBe('Bearer rotated');
		expect(readAuthState(event.cookies)?.session.refreshToken).toBe('rotated-refresh');
	});

	it('isolates credentials in concurrent requests from different users', async () => {
		const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async () => new Response());
		await Promise.all(
			['first', 'second'].map((token) =>
				handleFetch({
					event: createEvent(token).event,
					request: apiRequest(),
					fetch
				})
			)
		);
		expect(
			fetch.mock.calls.map(([request]) => (request as Request).headers.get('authorization'))
		).toEqual(['Bearer first', 'Bearer second']);
	});

	it('deduplicates concurrent refreshes and updates each request cookie', async () => {
		const first = createEvent('shared', true);
		const second = createEvent('shared', true);
		const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async () => new Response());
		await Promise.all(
			[first, second].map(({ event }) => handleFetch({ event, request: apiRequest(), fetch }))
		);
		expect(first.fetch.mock.calls.length + second.fetch.mock.calls.length).toBe(1);
		expect(readAuthState(first.event.cookies)?.session.accessToken).toBe('rotated');
		expect(readAuthState(second.event.cookies)?.session.accessToken).toBe('rotated');
	});

	it.each(['POST', 'PUT', 'PATCH', 'DELETE'])(
		'retries %s with its complete body once',
		async (method) => {
			const { event, fetch: refresh } = createEvent();
			const bodies: string[] = [];
			const bearers: (string | null)[] = [];
			const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (input) => {
				const request = input as Request;
				bodies.push(await request.text());
				bearers.push(request.headers.get('authorization'));
				return new Response(null, { status: 401 });
			});
			const response = await handleFetch({
				event,
				request: apiRequest('/lessons/one/progress', {
					method,
					body: JSON.stringify({ status: 'completed', text: '日本語' })
				}),
				fetch
			});
			expect(response.status).toBe(401);
			expect(bodies).toEqual(
				Array(2).fill(JSON.stringify({ status: 'completed', text: '日本語' }))
			);
			expect(bearers).toEqual(['Bearer access-token', 'Bearer rotated']);
			expect(refresh).toHaveBeenCalledOnce();
		}
	);

	it('clears invalid sessions and returns the original 401 without a retry', async () => {
		const { event, fetch: refresh, cookies } = createEvent();
		refresh.mockResolvedValue(Response.json({ error: 'Invalid refresh' }, { status: 401 }));
		const original = Response.json({ error: 'Expired' }, { status: 401 });
		const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(original);
		expect(await handleFetch({ event, request: apiRequest(), fetch })).toBe(original);
		expect(fetch).toHaveBeenCalledOnce();
		expect(cookies.delete).toHaveBeenCalledWith('nnh.auth', { path: '/' });
		expect(event.locals).toEqual({ user: null, session: null });
	});
});
