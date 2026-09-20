import { z } from 'zod';

export const signInRequestDtoSchema = z.object({
	email: z.email({ message: 'Format email tidak valid.' }),
	password: z.string().min(1, { message: 'Password wajib diisi.' })
});

export type SignInRequestDto = z.infer<typeof signInRequestDtoSchema>;

export const signInResponseDtoSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z.object({
		access_token: z.string(),
		token_type: z.string(),
		user: z
			.object({
				id: z.number(),
				email: z.string(),
				name: z.string()
			}),
		})
});

export type SignInResponseDto = z.infer<typeof signInResponseDtoSchema>;
