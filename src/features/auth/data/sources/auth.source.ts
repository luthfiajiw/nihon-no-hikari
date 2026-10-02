import {
	InvalidCredentialsError,
	InvalidRefreshTokenError,
	RefreshTokenError,
	SignInNetworkError,
	type RefreshTokenRequest,
	type SignInRequest,
	type SignInResponse,
	type SignOutRequest,
	type StoredAuthSession
} from '$features/auth/domain/entities/auth.entity';
import { HttpClient } from '$lib/http-client';

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === 'object' && value !== null;
}

function getErrorMessage(value: unknown): string | undefined {
	if (!isRecord(value)) return undefined;
	if (typeof value.message === 'string') return value.message;
	if (typeof value.error === 'string') return value.error;
	return undefined;
}

function extractSession(value: unknown, previous: StoredAuthSession): StoredAuthSession | null {
	if (!isRecord(value)) return null;
	const root = isRecord(value.data) ? value.data : value;
	const session = isRecord(root.session) ? root.session : root;
	if (
		typeof session.access_token !== 'string' ||
		typeof session.access_token_expires_at !== 'string'
	) {
		return null;
	}

	const next: StoredAuthSession = {
		id: typeof session.id === 'string' ? session.id : previous.id,
		accessToken: session.access_token,
		accessTokenExpiresAt: session.access_token_expires_at,
		refreshToken:
			typeof session.refresh_token === 'string' ? session.refresh_token : previous.refreshToken,
		refreshTokenExpiresAt:
			typeof session.refresh_token_expires_at === 'string'
				? session.refresh_token_expires_at
				: previous.refreshTokenExpiresAt
	};

	if (
		!next.id ||
		!next.accessToken ||
		!next.refreshToken ||
		!Number.isFinite(Date.parse(next.accessTokenExpiresAt)) ||
		!Number.isFinite(Date.parse(next.refreshTokenExpiresAt))
	) {
		return null;
	}

	return next;
}

export class AuthSource {
	constructor(private readonly httpClient: HttpClient) {}

	async signIn(payload: SignInRequest): Promise<SignInResponse> {
		let response;
		try {
			response = await this.httpClient.request<SignInResponse>('/api/auth/signin', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});
		} catch {
			throw new SignInNetworkError();
		}

		const json = response.data;

		if (!response.ok) {
			const error = json as SignInResponse & { error?: string };
			if (response.status === 401 || response.status === 400) {
				throw new InvalidCredentialsError(error.error);
			}
			throw new SignInNetworkError(error.error);
		}

		return json;
	}

	async refreshToken(
		payload: RefreshTokenRequest,
		currentSession: StoredAuthSession
	): Promise<StoredAuthSession> {
		let response;
		try {
			response = await this.httpClient.request<unknown>('/v1/auth/token', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});
		} catch {
			throw new RefreshTokenError('Gagal terhubung ke server autentikasi.');
		}

		if (!response.ok) {
			const message = getErrorMessage(response.data);
			if ([400, 401, 403].includes(response.status)) {
				throw new InvalidRefreshTokenError(message);
			}
			throw new RefreshTokenError(message);
		}

		const session = extractSession(response.data, currentSession);
		if (!session) throw new RefreshTokenError('Response refresh token tidak valid.');

		return session;
	}

	async signOut(payload: SignOutRequest): Promise<boolean> {
		try {
			const response = await this.httpClient.request('/v1/auth/signout', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			return response.ok;
		} catch {
			return false;
		}
	}
}
