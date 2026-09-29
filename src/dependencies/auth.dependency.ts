import { AuthRepositoryImpl } from "$features/signin/data/repositories/auth.repository.impl";
import { AuthSource } from "$features/signin/data/sources/auth.source";
import { SignInUseCase } from "$features/signin/domain/usecases/sign-in.usecase";
import { HttpClient } from "$lib/http-client";

const authHttpClient = new HttpClient();

const authSource = new AuthSource(authHttpClient);
const authRepository = new AuthRepositoryImpl(authSource);

export const signInUseCase = new SignInUseCase(authRepository);