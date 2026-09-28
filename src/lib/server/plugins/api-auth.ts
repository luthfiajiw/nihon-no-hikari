import { env } from '$env/dynamic/private';
import type { SignInResponse } from '$features/signin/domain/entities/auth.entity';
import type { BetterAuthPlugin, Status } from 'better-auth';
import { createAuthEndpoint } from 'better-auth/api';
import { setSessionCookie } from 'better-auth/cookies';
import * as z from 'zod';

const signInBodySchema = z.object({
	email: z.string(),
	password: z.string()
});

function getErrorMessage(value: unknown): string | undefined {
	if (!value || typeof value !== 'object') return undefined;
	if ('message' in value && typeof value.message === 'string') return value.message;
	if ('error' in value && typeof value.error === 'string') return value.error;
	return undefined;
}

export const apiAuth = (): BetterAuthPlugin => ({
	id: 'api-auth',
	endpoints: {
		signInWithApi: createAuthEndpoint(
			'/signin',
			{
				method: 'POST',
				body: signInBodySchema
			},
			async (ctx) => {
				const apiBaseUrl = env.API_BASE_URL?.replace(/\/$/, '');
				if (!apiBaseUrl) {
					return ctx.json({ error: 'API_BASE_URL belum dikonfigurasi.' }, { status: 400 });
				}

				const email = ctx.body.email.trim();
				if (!z.email().safeParse(email).success || !ctx.body.password) {
					return ctx.json({ error: 'Email atau password tidak valid.' }, { status: 400 });
				}

				let response: Response;

				try {
					response = await fetch(`${apiBaseUrl}/v1/auth/signin`, {
						method: 'POST',
						headers: {
							Accept: 'application/json',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ email, password: ctx.body.password })
					});

					if (!response.ok) {
						const json = await response.json()
						ctx.setStatus(response.status as Status)
						return ctx.json(json);
					}
				} catch (error) {
					ctx.setStatus(400)
					return ctx.json({
						error: 'Gagal terhubung ke server. Silakan coba lagi.' + error
					});
				}

				const payload: unknown = await response.json().catch(() => null);

				if (!response.ok) {
					const message = getErrorMessage(payload);
					if (response.status >= 500) {
						return ctx.json(
							{ error: message ?? 'Server autentikasi sedang bermasalah. Silakan coba lagi.' },
							{ status: 400 }
						);
					}

					return ctx.json(
						{ error: message ?? 'Email atau password yang Anda masukkan salah.' },
						{ status: response.status === 401 ? 401 : 400 }
					);
				}

				const data = payload as SignInResponse;
				if (!data?.success || !data.data?.session) {
					return ctx.json(
						{ error: data?.message || 'Response signin tidak valid.' },
						{ status: 400 }
					);
				}

				const apiUser = data.data;
				const apiSession = apiUser.session;
				const accessTokenExpiresAt = new Date(apiSession.access_token_expires_at);
				const refreshTokenExpiresAt = new Date(apiSession.refresh_token_expires_at);

				if (
					Number.isNaN(accessTokenExpiresAt.getTime()) ||
					Number.isNaN(refreshTokenExpiresAt.getTime())
				) {
					return ctx.json({ error: 'Masa berlaku session dari API tidak valid.' }, { status: 400 });
				}

				const existingUser = await ctx.context.internalAdapter.findUserByEmail(apiUser.email);
				const user = existingUser
					? await ctx.context.internalAdapter.updateUser(existingUser.user.id, {
							name: apiUser.display_name,
							image: apiUser.avatar_url ?? null,
							emailVerified: true
						})
					: await ctx.context.internalAdapter.createUser(
							{
								id: apiUser.id,
								email: apiUser.email,
								name: apiUser.display_name,
								image: apiUser.avatar_url ?? null,
								emailVerified: true
							},
							{ method: 'email-password' }
						);

				const session = await ctx.context.internalAdapter.createSession(
					user.id,
					false,
					{
						expiresAt: refreshTokenExpiresAt,
						externalSessionId: apiSession.id,
						accessToken: apiSession.access_token,
						accessTokenExpiresAt,
						refreshToken: apiSession.refresh_token,
						refreshTokenExpiresAt
					},
					true
				);

				await setSessionCookie(ctx, { session, user });

				return ctx.json(data);
			}
		)
	}
});
