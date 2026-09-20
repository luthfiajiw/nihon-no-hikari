import type { AuthRepository } from '../../domain/repositories/auth.repository';
import type { AuthResponse, SignInForm } from '../../domain/entities/auth.entity';
import {
	InvalidCredentialsError,
	SignInNetworkError,
	DomainError
} from '../../domain/entities/auth.entity';
import { AuthApiService } from '../sources/auth-api.service';

export class AuthRepositoryImpl implements AuthRepository {
	constructor(private readonly apiService: AuthApiService = new AuthApiService()) {}

	async signIn(credentials: SignInForm): Promise<AuthResponse> {
		try {
			const { status, data } = await this.apiService.signIn({
				email: credentials.email,
				password: credentials.password
			});

			if (status === 200 || status === 201) {
				return {
					success: data.success,
					message: data.message,
					data: {
						accessToken: data.data.access_token,
						tokenType: data.data.token_type,
						user: data.data.user
					}
				}
			}

			if (status === 401 || status === 400) {
				throw new InvalidCredentialsError(
					data.message || 'Email atau password yang Anda masukkan tidak valid.'
				);
			}

			throw new DomainError(
				data.message || `Terjadi kesalahan saat sign in (Kode status: ${status}).`
			);
		} catch (error) {
			if (error instanceof DomainError) {
				throw error;
			}
			throw new SignInNetworkError();
		}
	}
}
