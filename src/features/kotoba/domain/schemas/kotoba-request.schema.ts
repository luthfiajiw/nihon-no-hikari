import { z } from 'zod';
import { resourceIdSchema } from '$lib/server/validation';

const required = z.string().trim().min(1, 'Kolom wajib diisi.');
const word = z
	.strictObject({
		id: resourceIdSchema.optional(),
		kanji: required,
		hiragana: required,
		romaji: required,
		translation: required,
		furigana: z.array(z.strictObject({ text: required, reading: z.string().optional() })),
		example: z.strictObject({ japanese: required, indonesian: required }),
		type: z.enum(['Kata Benda', 'Kata Kerja', 'Kata Sifat', 'Lainnya']),
		audio_media_id: resourceIdSchema.nullable().optional()
	})
	.superRefine((value, ctx) => {
		if (value.furigana.length && value.furigana.map((part) => part.text).join('') !== value.kanji)
			ctx.addIssue({
				code: 'custom',
				path: ['furigana'],
				message: 'Gabungan segmen harus sama dengan kata Jepang.'
			});
	});
const topic = z.strictObject({
	title: required.refine((value) => [...value].length <= 160, 'Judul maksimal 160 karakter.'),
	description: required.refine(
		(value) => [...value].length <= 200,
		'Deskripsi maksimal 200 karakter.'
	),
	level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
	category: z.enum(['Dasar', 'Populer', 'Pemula']),
	order_index: z.number().int().min(1).max(2147483647),
	is_active: z.boolean(),
	is_visible: z.boolean(),
	cover_media_id: resourceIdSchema,
	version: z.number().int().positive().optional(),
	vocabulary: z.array(word).min(1)
});
function checkIDs(value: z.infer<typeof topic>, ctx: z.RefinementCtx, create: boolean) {
	const ids = new Set<string>();
	value.vocabulary.forEach((item, index) => {
		if (item.id) {
			if (create || ids.has(item.id))
				ctx.addIssue({
					code: 'custom',
					path: ['vocabulary', index, 'id'],
					message: 'ID kosakata tidak valid atau duplikat.'
				});
			ids.add(item.id);
		}
	});
}
export const createKotobaTopicSchema = topic.superRefine((value, ctx) =>
	checkIDs(value, ctx, true)
);
export const updateKotobaTopicSchema = topic
	.extend({ version: z.number().int().positive() })
	.superRefine((value, ctx) => checkIDs(value, ctx, false));
