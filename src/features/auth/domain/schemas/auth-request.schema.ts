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

const registerDisplayNameSchema = z
	.string({ error: 'Nama tampilan wajib diisi.' })
	.trim()
	.min(1, 'Nama tampilan wajib diisi.');

export const registerRequestSchema = z
	.object({
		display_name: registerDisplayNameSchema,
		email: signInEmailSchema,
		password: signInPasswordSchema,
		confirm_password: z
			.string({ error: 'Konfirmasi password wajib diisi.' })
			.min(1, 'Konfirmasi password wajib diisi.')
	})
	.refine((data) => data.password === data.confirm_password, {
		message: 'Konfirmasi password tidak cocok dengan password.',
		path: ['confirm_password']
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
