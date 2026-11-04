import { CheckAuthAdminAccessUseCase } from '$features/auth/domain/usecases/auth-admin-access.usecase';
import { requestFetch } from '#request-fetch';
import { AuthRepositoryImpl } from '$features/auth/data/repositories/auth.repository.impl';
import { AuthSource } from '$features/auth/data/sources/auth.source';
import { RegisterUseCase } from '$features/auth/domain/usecases/register.usecase';
import { SignInUseCase } from '$features/auth/domain/usecases/sign-in.usecase';
import { GoogleSignInUseCase } from '$features/auth/domain/usecases/google-sign-in.usecase';
import { RefreshTokenUseCase } from '$features/auth/domain/usecases/refresh-token.usecase';
import { SignOutUseCase } from '$features/auth/domain/usecases/sign-out.usecase';

const repository = new AuthRepositoryImpl(new AuthSource(requestFetch));

export const registerUseCase = new RegisterUseCase(repository);
export const signInUseCase = new SignInUseCase(repository);
export const googleSignInUseCase = new GoogleSignInUseCase(repository);
export const refreshTokenUseCase = new RefreshTokenUseCase(repository);
export const signOutUseCase = new SignOutUseCase(repository);

export const checkAuthAdminAccessUseCase = new CheckAuthAdminAccessUseCase(repository);
