import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import type {
	AuthState,
	AuthUser,
	StoredAuthSession
} from '$features/auth/domain/entities/auth.entity';
import type { Cookies } from '@sveltejs/kit';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const AUTH_COOKIE_NAME = 'nnh.auth';
const AUTH_COOKIE_VERSION = 1;
const LEGACY_AUTH_COOKIE_PREFIXES = [
	'better-auth.',
	'__Secure-better-auth.',
	'__Host-better-auth.'
];

type JsonRecord = Record<string, unknown>;

interface StoredAuthState extends AuthState {
	version: number;
}

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === 'object' && value !== null;
}

function getEncryptionKey(): Buffer {
	const secret = env.AUTH_SECRET ?? env.BETTER_AUTH_SECRET;
	if (!secret) throw new Error('AUTH_SECRET belum dikonfigurasi.');
	return createHash('sha256').update(secret).digest();
}

function isValidUser(value: unknown): value is AuthUser {
	return (
		isRecord(value) &&
		typeof value.id === 'string' &&
		typeof value.email === 'string' &&
		typeof value.display_name === 'string' &&
		(typeof value.avatar_url === 'string' || value.avatar_url === undefined)
	);
}

function isValidSession(value: unknown): value is StoredAuthSession {
	return (
		isRecord(value) &&
		typeof value.id === 'string' &&
		typeof value.accessToken === 'string' &&
		typeof value.accessTokenExpiresAt === 'string' &&
		typeof value.refreshToken === 'string' &&
		typeof value.refreshTokenExpiresAt === 'string' &&
		Number.isFinite(Date.parse(value.accessTokenExpiresAt)) &&
		Number.isFinite(Date.parse(value.refreshTokenExpiresAt))
	);
}

function encryptState(state: AuthState): string {
	const iv = randomBytes(12);
	const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
	const plaintext = Buffer.from(
		JSON.stringify({ ...state, version: AUTH_COOKIE_VERSION } satisfies StoredAuthState),
		'utf8'
	);
	const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
	const tag = cipher.getAuthTag();

	return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

function decryptState(value: string): StoredAuthState | null {
	try {
		const payload = Buffer.from(value, 'base64url');
		if (payload.length <= 28) return null;

		const iv = payload.subarray(0, 12);
		const tag = payload.subarray(12, 28);
		const encrypted = payload.subarray(28);
		const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);
		decipher.setAuthTag(tag);
		const json = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
		const state: unknown = JSON.parse(json);

		if (!isRecord(state) || state.version !== AUTH_COOKIE_VERSION) return null;
		if (!isValidUser(state.user) || !isValidSession(state.session)) return null;

		return state as unknown as StoredAuthState;
	} catch {
		return null;
	}
}

export function setAuthState(cookies: Cookies, state: AuthState): void {
	const value = encryptState(state);
	if (value.length > 3800) {
		throw new Error('Data autentikasi terlalu besar untuk disimpan dalam cookie.');
	}

	cookies.set(AUTH_COOKIE_NAME, value, {
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax',
		path: '/',
		expires: new Date(state.session.refreshTokenExpiresAt)
	});
}

export function clearAuthState(cookies: Cookies): void {
	cookies.delete(AUTH_COOKIE_NAME, { path: '/' });
}

export function clearLegacyAuthCookies(cookies: Cookies): void {
	for (const { name } of cookies.getAll()) {
		if (LEGACY_AUTH_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix))) {
			cookies.delete(name, { path: '/' });
		}
	}
}

export function readAuthState(cookies: Cookies): AuthState | null {
	const value = cookies.get(AUTH_COOKIE_NAME);
	if (!value) return null;

	const state = decryptState(value);
	if (!state || Date.parse(state.session.refreshTokenExpiresAt) <= Date.now()) {
		clearAuthState(cookies);
		return null;
	}

	return { user: state.user, session: state.session };
}

export function toAuthState(payload: unknown): AuthState | null {
	if (!isRecord(payload) || !isRecord(payload.data) || !isRecord(payload.data.session)) {
		return null;
	}

	const data = payload.data;
	const apiSession = data.session as JsonRecord;
	const user: AuthUser = {
		id: typeof data.id === 'string' ? data.id : '',
		email: typeof data.email === 'string' ? data.email : '',
		display_name: typeof data.display_name === 'string' ? data.display_name : '',
		avatar_url: typeof data.avatar_url === 'string' ? data.avatar_url : undefined
	};
	const session: StoredAuthSession = {
		id: typeof apiSession.id === 'string' ? apiSession.id : '',
		accessToken: typeof apiSession.access_token === 'string' ? apiSession.access_token : '',
		accessTokenExpiresAt:
			typeof apiSession.access_token_expires_at === 'string'
				? apiSession.access_token_expires_at
				: '',
		refreshToken: typeof apiSession.refresh_token === 'string' ? apiSession.refresh_token : '',
		refreshTokenExpiresAt:
			typeof apiSession.refresh_token_expires_at === 'string'
				? apiSession.refresh_token_expires_at
				: ''
	};

	return isValidUser(user) && isValidSession(session) ? { user, session } : null;
}
