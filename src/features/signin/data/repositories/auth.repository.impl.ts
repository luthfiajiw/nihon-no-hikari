import type { AuthRepository } from '../../domain/repositories/auth.repository';
import {
	type SignInRequest,
	type SignInResponse
} from '../../domain/entities/auth.entity';
import { AuthSource } from '../sources/auth.source';

export class AuthRepositoryImpl implements AuthRepository {
	constructor(private readonly apiService: AuthSource) {}

	async signIn(credentials: SignInRequest): Promise<SignInResponse> {
		const data = await this.apiService.signIn(credentials);

		return data;
	}
}
