import type { SignInRequestDto, SignInResponseDto } from '../dtos/auth.dto';
import { HttpClient, defaultHttpClient } from '$lib/http-client';

export class AuthApiService {
	private readonly client: HttpClient;

	constructor(client: HttpClient = defaultHttpClient) {
		this.client = client;
	}

	async signIn(payload: SignInRequestDto): Promise<{ status: number; data: SignInResponseDto }> {
		const response = await this.client.post<SignInResponseDto>('/v1/signin', payload, {
			headers: {
				Accept: 'application/json'
			}
		});

		return {
			status: response.status,
			data: response.data
		};
	}
}

