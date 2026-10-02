import { env } from '$env/dynamic/private';
import { InvalidRefreshTokenError } from '$features/auth/domain/entities/auth.entity';
import type { StoredAuthSession } from '$features/auth/domain/entities/auth.entity';
import type { RequestEvent } from '@sveltejs/kit';
import { createAuthServerDependencies } from '../../dependencies/auth.dependency';
import { clearAuthState, clearLegacyAuthCookies, readAuthState, setAuthState } from './auth-cookie';

const ACCESS_TOKEN_CLOCK_SKEW_MS = 15_000;

type RefreshResult =
	| { status: 'refreshed'; session: StoredAuthSession }
	| { status: 'invalid' }
	| { status: 'failed' };

// SvelteKit can start multiple server requests for the same navigation (for
// example due to preloading). A refresh token may only be rotated once, so all
// requests using the same session/token must share the in-flight refresh.
const pendingRefreshes = new Map<string, Promise<RefreshResult>>();

function getApiBaseUrl(): string {
	const baseUrl = env.API_BASE_URL?.replace(/\/$/, '');
	if (!baseUrl) throw new Error('API_BASE_URL belum dikonfigurasi.');
	return baseUrl;
}

export function initializeAuthLocals(event: RequestEvent): void {
	clearLegacyAuthCookies(event.cookies);
	const state = readAuthState(event.cookies);
	event.locals.user = state?.user ?? null;
	event.locals.session = state?.session ?? null;
}

export async function refreshAuthSession(event: RequestEvent): Promise<StoredAuthSession | null> {
	const current = event.locals.session;
	const user = event.locals.user;
	if (!current || !user) return null;

	const refreshKey = `${current.id}\0${current.refreshToken}`;
	let pendingRefresh = pendingRefreshes.get(refreshKey);

	if (!pendingRefresh) {
		pendingRefresh = (async (): Promise<RefreshResult> => {
			try {
				const { refreshTokenUseCase } = createAuthServerDependencies(event.fetch, getApiBaseUrl());
				const session = await refreshTokenUseCase.exec(current);
				return { status: 'refreshed', session };
			} catch (error) {
				return error instanceof InvalidRefreshTokenError
					? { status: 'invalid' }
					: { status: 'failed' };
			}
		})();

		pendingRefreshes.set(refreshKey, pendingRefresh);
		void pendingRefresh.finally(() => {
			if (pendingRefreshes.get(refreshKey) === pendingRefresh) {
				pendingRefreshes.delete(refreshKey);
			}
		});
	}

	const result = await pendingRefresh;

	if (result.status === 'refreshed') {
		const session = result.session;
		try {
			setAuthState(event.cookies, { user, session });
		} catch {
			clearAuthState(event.cookies);
			event.locals.user = null;
			event.locals.session = null;
			return null;
		}
		event.locals.session = session;
		return session;
	}

	if (result.status === 'invalid') {
		clearAuthState(event.cookies);
		event.locals.user = null;
		event.locals.session = null;
	}

	return null;
}

export async function getValidAccessToken(event: RequestEvent): Promise<string | null> {
	const session = event.locals.session;
	if (!session) return null;

	if (Date.parse(session.accessTokenExpiresAt) > Date.now() + ACCESS_TOKEN_CLOCK_SKEW_MS) {
		return session.accessToken;
	}

	return (await refreshAuthSession(event))?.accessToken ?? null;
}

export async function revokeAuthSession(event: RequestEvent): Promise<boolean> {
	const session = event.locals.session;
	if (!session) return true;

	try {
		const { signOutUseCase } = createAuthServerDependencies(event.fetch, getApiBaseUrl());
		return await signOutUseCase.exec(session.id);
	} catch {
		return false;
	}
}
