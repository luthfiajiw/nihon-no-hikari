export interface SignInForm {
	email: string;
	password: string;
}

export interface AuthUser {
	id: number;
	email: string;
	name: string;
}

export interface AuthData {
	accessToken: string;
	tokenType: string;
	user: AuthUser;
}

export interface AuthResponse {
	success: boolean
	message: string
	data: AuthData
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
