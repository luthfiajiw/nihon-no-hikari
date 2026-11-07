import { z } from 'zod';

export const updateProfileSchema = z.object({
	display_name: z
		.string()
		.trim()
		.min(1, 'Nama tampilan tidak boleh kosong.')
		.max(120, 'Nama tampilan maksimal 120 karakter.'),
	avatar_url: z.string().nullable().optional()
});

export const changePasswordSchema = z
	.object({
		current_password: z.string().optional(),
		new_password: z.string().min(8, 'Kata sandi baru minimal 8 karakter.'),
		confirm_password: z.string().min(1, 'Konfirmasi kata sandi harus diisi.')
	})
	.refine((data) => data.new_password === data.confirm_password, {
		message: 'Konfirmasi kata sandi tidak cocok.',
		path: ['confirm_password']
	});

export const verifyCodeSchema = z.object({
	code: z
		.string()
		.trim()
		.regex(/^\d{6}$/, 'Kode verifikasi harus berupa 6 digit angka.')
});

export const linkGoogleSchema = z.object({
	id_token: z.string().trim().min(1, 'Token Google tidak boleh kosong.'),
	verification_token: z.string().trim().min(1, 'Token verifikasi email tidak boleh kosong.')
});
