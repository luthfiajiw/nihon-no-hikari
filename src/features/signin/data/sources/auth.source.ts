import {
	InvalidCredentialsError,
	type SignInRequest,
	type SignInResponse
} from '$features/signin/domain/entities/auth.entity';
import { HttpClient } from '$lib/http-client';

const sameOriginHttpClient = new HttpClient({ baseUrl: '' });

export class AuthSource {
	constructor(private readonly httpClient: HttpClient = sameOriginHttpClient) {}

	async signIn(payload: SignInRequest): Promise<SignInResponse> {
		// Meneruskan ke endpoint proxy better auth
		const response = await this.httpClient.post<SignInResponse>('/api/auth/signin', payload, {
			headers: {
				Accept: 'application/json'
			}
		});

		const json = response.data;

		if (!response.ok) {
			if (response.status === 401 || response.status === 400) {
				const error = json as SignInResponse & { error?: string };
				throw new InvalidCredentialsError(error.error);
			}
		}

		return json;
	}
}
