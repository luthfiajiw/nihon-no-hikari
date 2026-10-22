import { z } from 'zod';
import { resourceIdSchema, uniqueIds } from '$lib/server/validation';

export const strokeInputSchema = z
	.array(z.array(z.object({ x: z.number(), y: z.number() })))
	.refine((value) => new TextEncoder().encode(JSON.stringify(value)).length <= 64 * 1024, {
		message: 'Data goresan maksimal 64 KiB.'
	});

export const submitAttemptRequestSchema = z.object({
	answers: z
		.array(
			z
				.object({
					question_id: resourceIdSchema,
					selected_option_id: resourceIdSchema.nullable().default(null),
					stroke_input: strokeInputSchema.nullable().default(null)
				})
				.refine((answer) => answer.selected_option_id === null || answer.stroke_input === null, {
					message: 'Jawaban hanya boleh berisi pilihan atau goresan.',
					path: ['stroke_input']
				})
		)
		.refine((answers) => uniqueIds(answers.map((answer) => answer.question_id)), {
			message: 'ID soal tidak boleh duplikat.'
		})
});
