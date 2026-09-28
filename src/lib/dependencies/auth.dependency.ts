import { AuthRepositoryImpl } from "$features/signin/data/repositories/auth.repository.impl";
import { AuthSource } from "$features/signin/data/sources/auth.source";
import { SignInUseCase } from "$features/signin/domain/usecases/sign-in.usecase";

export const authSource = new AuthSource();
export const authRepository = new AuthRepositoryImpl(authSource);

export const signInUseCase = new SignInUseCase(authRepository);