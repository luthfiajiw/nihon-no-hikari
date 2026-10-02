import { AuthRepositoryImpl } from "$features/auth/data/repositories/auth.repository.impl";
import { AuthSource } from "$features/auth/data/sources/auth.source";
import { SignInUseCase } from "$features/auth/domain/usecases/sign-in.usecase";
import { RefreshTokenUseCase } from '$features/auth/domain/usecases/refresh-token.usecase';
import { SignOutUseCase } from '$features/auth/domain/usecases/sign-out.usecase';
import { HttpClient } from "$lib/http-client";

const authHttpClient = new HttpClient({
	baseUrl: ''
});

const authSource = new AuthSource(authHttpClient);
const authRepository = new AuthRepositoryImpl(authSource);

export const signInUseCase = new SignInUseCase(authRepository);

export function createAuthServerDependencies(customFetch: typeof fetch, apiBaseUrl: string) {
	const httpClient = new HttpClient({
		fetch: customFetch,
		baseUrl: apiBaseUrl
	});
	const source = new AuthSource(httpClient);
	const repository = new AuthRepositoryImpl(source);

	return {
		refreshTokenUseCase: new RefreshTokenUseCase(repository),
		signOutUseCase: new SignOutUseCase(repository)
	};
}
