import { z } from 'zod';

const signInEmailSchema = z
	.string({ error: 'Email wajib diisi.' })
	.trim()
	.min(1, 'Email wajib diisi.')
	.pipe(z.email({ error: 'Format email tidak valid.' }));

const signInPasswordSchema = z
	.string({ error: 'Password wajib diisi.' })
	.min(1, 'Password wajib diisi.')
	.min(6, 'Password minimal 6 karakter.');

export const signInRequestSchema = z.object({
	email: signInEmailSchema,
	password: signInPasswordSchema
});

export const refreshTokenRequestSchema = z.object({
	grant_type: z.literal('refresh', { error: 'Grant type tidak valid.' }),
	token: z.string({ error: 'Refresh token wajib diisi.' }).min(1, 'Refresh token wajib diisi.')
});

export const signOutRequestSchema = z.object({
	session_id: z
		.string({ error: 'Session ID wajib diisi.' })
		.trim()
		.min(1, 'Session ID wajib diisi.')
});
