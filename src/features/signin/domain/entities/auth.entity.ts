export interface AuthUser {
	id: string;
	email: string;
	display_name: string;
	avatar_url?: string;
}

export interface AuthSession {
	id: string;
	access_token: string;
	access_token_expires_at: string;
	refresh_token: string;
	refresh_token_expires_at: string;
}

export interface SignInRequest {
	email: string;
	password: string;
}

export interface SignInResponse {
	success: boolean;
	message: string;
	data: {
		id: string;
		email: string;
		display_name: string;
		avatar_url?: string;
		session: AuthSession;
	};
}

export class DomainError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'DomainError';
	}
}

export class InvalidCredentialsError extends DomainError {
	constructor(message = 'Email atau password yang Anda masukkan salah.') {
		super(message);
		this.name = 'InvalidCredentialsError';
	}
}

export class SignInNetworkError extends DomainError {
	constructor(message = 'Gagal terhubung ke server. Silakan coba lagi.') {
		super(message);
		this.name = 'SignInNetworkError';
	}
}
