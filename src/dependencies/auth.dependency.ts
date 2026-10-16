import { requestFetch } from '#request-fetch';
import { AuthRepositoryImpl } from '$features/auth/data/repositories/auth.repository.impl';
import { AuthSource } from '$features/auth/data/sources/auth.source';
import { SignInUseCase } from '$features/auth/domain/usecases/sign-in.usecase';
import { RefreshTokenUseCase } from '$features/auth/domain/usecases/refresh-token.usecase';
import { SignOutUseCase } from '$features/auth/domain/usecases/sign-out.usecase';

const repository = new AuthRepositoryImpl(new AuthSource(requestFetch));

export const signInUseCase = new SignInUseCase(repository);
export const refreshTokenUseCase = new RefreshTokenUseCase(repository);
export const signOutUseCase = new SignOutUseCase(repository);
