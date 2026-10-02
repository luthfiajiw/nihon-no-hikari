import type { AuthState } from '$features/auth/domain/entities/auth.entity';
import type { Cookies, RequestEvent } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/environment', () => ({ dev: true }));
vi.mock('$env/dynamic/private', () => ({
	env: {
		AUTH_SECRET: 'test-secret-with-enough-entropy-for-auth-cookie',
		API_BASE_URL: 'https://api.example.com'
	}
}));

import { clearAuthState, clearLegacyAuthCookies, readAuthState, setAuthState } from './auth-cookie';
import { getValidAccessToken, refreshAuthSession, revokeAuthSession } from './auth';

const initialState: AuthState = {
	user: {
		id: 'user-1',
		email: 'user@example.com',
		display_name: 'Test User'
	},
	session: {
		id: 'session-1',
		accessToken: 'old-access-token',
		accessTokenExpiresAt: '2026-10-02T10:00:00.000Z',
		refreshToken: 'refresh-token',
		refreshTokenExpiresAt: '2099-10-09T10:00:00.000Z'
	}
};

function createCookies() {
	const values = new Map<string, string>();
	const cookies = {
		get: vi.fn((name: string) => values.get(name)),
		getAll: vi.fn(() => Array.from(values, ([name, value]) => ({ name, value }))),
		set: vi.fn((name: string, value: string) => values.set(name, value)),
		delete: vi.fn((name: string) => values.delete(name))
	} as unknown as Cookies;

	return { cookies, values };
}

function createEvent(cookies: Cookies, fetchMock: typeof fetch): RequestEvent {
	return {
		cookies,
		fetch: fetchMock,
		locals: {
			user: initialState.user,
			session: initialState.session
		}
	} as unknown as RequestEvent;
}

describe('server auth', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('encrypts and restores auth state from the HttpOnly cookie', () => {
		const { cookies, values } = createCookies();

		setAuthState(cookies, initialState);

		expect(values.get('nnh.auth')).not.toContain('refresh-token');
		expect(readAuthState(cookies)).toEqual(initialState);
	});

	it('rejects a tampered auth cookie', () => {
		const { cookies, values } = createCookies();
		setAuthState(cookies, initialState);
		values.set('nnh.auth', `${values.get('nnh.auth')}tampered`);

		expect(readAuthState(cookies)).toBeNull();
		expect(values.has('nnh.auth')).toBe(false);
	});

	it('refreshes using the refresh token and rotates the stored session', async () => {
		const { cookies } = createCookies();
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					data: {
						access_token: 'new-access-token',
						access_token_expires_at: '2099-10-02T11:00:00.000Z',
						refresh_token: 'new-refresh-token',
						refresh_token_expires_at: '2099-10-09T11:00:00.000Z'
					}
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			)
		);
		const event = createEvent(cookies, fetchMock as typeof fetch);

		const session = await refreshAuthSession(event);

		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.example.com/v1/auth/token',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ grant_type: 'refresh', token: 'refresh-token' })
			})
		);
		expect(session?.accessToken).toBe('new-access-token');
		expect(session?.refreshToken).toBe('new-refresh-token');
	});

	it('deduplicates concurrent refreshes and updates every request cookie', async () => {
		const first = createCookies();
		const second = createCookies();
		let finishRefresh!: (response: Response) => void;
		const refreshResponse = new Promise<Response>((resolve) => {
			finishRefresh = resolve;
		});
		const fetchMock = vi.fn().mockReturnValue(refreshResponse);
		const firstEvent = createEvent(first.cookies, fetchMock as typeof fetch);
		const secondEvent = createEvent(second.cookies, fetchMock as typeof fetch);

		const firstRefresh = refreshAuthSession(firstEvent);
		const secondRefresh = refreshAuthSession(secondEvent);

		expect(fetchMock).toHaveBeenCalledOnce();

		finishRefresh(
			new Response(
				JSON.stringify({
					data: {
						access_token: 'shared-access-token',
						access_token_expires_at: '2099-10-02T11:00:00.000Z',
						refresh_token: 'shared-refresh-token',
						refresh_token_expires_at: '2099-10-09T11:00:00.000Z'
					}
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			)
		);

		const [firstSession, secondSession] = await Promise.all([firstRefresh, secondRefresh]);

		expect(firstSession?.accessToken).toBe('shared-access-token');
		expect(secondSession).toEqual(firstSession);
		expect(first.cookies.set).toHaveBeenCalledWith(
			'nnh.auth',
			expect.any(String),
			expect.any(Object)
		);
		expect(second.cookies.set).toHaveBeenCalledWith(
			'nnh.auth',
			expect.any(String),
			expect.any(Object)
		);
	});

	it('returns no token instead of throwing when auth configuration is unavailable', async () => {
		const { env } = await import('$env/dynamic/private');
		const previousApiBaseUrl = env.API_BASE_URL;
		env.API_BASE_URL = '';
		const { cookies } = createCookies();
		const fetchMock = vi.fn();
		const event = createEvent(cookies, fetchMock as typeof fetch);

		try {
			await expect(getValidAccessToken(event)).resolves.toBeNull();
			expect(fetchMock).not.toHaveBeenCalled();
		} finally {
			env.API_BASE_URL = previousApiBaseUrl;
		}
	});

	it('allows local sign-out when auth configuration is unavailable', async () => {
		const { env } = await import('$env/dynamic/private');
		const previousApiBaseUrl = env.API_BASE_URL;
		env.API_BASE_URL = '';
		const { cookies } = createCookies();
		const fetchMock = vi.fn();
		const event = createEvent(cookies, fetchMock as typeof fetch);

		try {
			await expect(revokeAuthSession(event)).resolves.toBe(false);
			expect(fetchMock).not.toHaveBeenCalled();
		} finally {
			env.API_BASE_URL = previousApiBaseUrl;
		}
	});

	it('revokes the backend session using its session id', async () => {
		const { cookies } = createCookies();
		const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
		const event = createEvent(cookies, fetchMock as typeof fetch);

		await expect(revokeAuthSession(event)).resolves.toBe(true);
		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.example.com/v1/auth/signout',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ session_id: 'session-1' })
			})
		);
	});

	it('clears the auth cookie', () => {
		const { cookies, values } = createCookies();
		setAuthState(cookies, initialState);

		clearAuthState(cookies);

		expect(values.has('nnh.auth')).toBe(false);
	});

	it('clears legacy Better Auth cookies without clearing the current auth cookie', () => {
		const { cookies, values } = createCookies();
		values.set('nnh.auth', 'current-session');
		values.set('better-auth.session_token', 'legacy-token');
		values.set('better-auth.session_data.0', 'legacy-session-chunk');
		values.set('__Secure-better-auth.session_data.1', 'legacy-secure-chunk');

		clearLegacyAuthCookies(cookies);

		expect(values.get('nnh.auth')).toBe('current-session');
		expect(values.has('better-auth.session_token')).toBe(false);
		expect(values.has('better-auth.session_data.0')).toBe(false);
		expect(values.has('__Secure-better-auth.session_data.1')).toBe(false);
	});
});
