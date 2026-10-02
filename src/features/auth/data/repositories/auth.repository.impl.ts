import type { AuthRepository } from '../../domain/repositories/auth.repository';
import {
	type RefreshTokenRequest,
	type SignInRequest,
	type SignInResponse,
	type SignOutRequest,
	type StoredAuthSession
} from '../../domain/entities/auth.entity';
import { AuthSource } from '../sources/auth.source';

export class AuthRepositoryImpl implements AuthRepository {
	constructor(private readonly apiService: AuthSource) {}

	async signIn(credentials: SignInRequest): Promise<SignInResponse> {
		const data = await this.apiService.signIn(credentials);

		return data;
	}

	refreshToken(
		payload: RefreshTokenRequest,
		currentSession: StoredAuthSession
	): Promise<StoredAuthSession> {
		return this.apiService.refreshToken(payload, currentSession);
	}

	signOut(payload: SignOutRequest): Promise<boolean> {
		return this.apiService.signOut(payload);
	}
}
