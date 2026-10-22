import { z } from 'zod';
import { resourceIdSchema, uniqueIds } from '$lib/server/validation';
import type { AdminContentKind } from '../entities/admin.entity';
import { MAX_KANA_SVG_BYTES } from '../entities/kana-template.entity';

function integer(label: string, max: number, min = 0) {
	return z
		.number({ error: `${label} harus berupa angka.` })
		.int(`${label} harus berupa bilangan bulat.`)
		.min(min, `${label} minimal ${min}.`)
		.max(max, `${label} maksimal ${max}.`);
}

const title = z
	.string({ error: 'Judul wajib diisi.' })
	.refine((value) => value.trim().length > 0, 'Judul wajib diisi.')
	.refine((value) => new TextEncoder().encode(value).length <= 160, 'Judul maksimal 160 byte.');
const slug = z
	.string({ error: 'Slug wajib diisi.' })
	.max(120, 'Slug maksimal 120 karakter.')
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug harus berupa huruf kecil, angka, dan tanda hubung.');
const mediaUrl = z
	.string({ error: 'URL media tidak valid.' })
	.refine((value) => {
		if (value === '') return true;
		try {
			const url = new URL(value);
			return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname);
		} catch {
			return false;
		}
	}, 'URL media harus menggunakan HTTP atau HTTPS.')
	.nullable()
	.optional();
const prerequisiteIds = z
	.array(resourceIdSchema)
	.refine(uniqueIds, 'ID prasyarat tidak boleh duplikat.')
	.nullable()
	.optional();

// Preserve additional lesson metadata and accept legacy HTML stored as a string.
export const adminLessonContentSchema = z.preprocess(
	(value) => (typeof value === 'string' ? { content: value, tips: '' } : (value ?? {})),
	z.looseObject({
		content: z.string({ error: 'HTML lesson harus berupa teks.' }).default(''),
		tips: z.string({ error: 'Tips lesson harus berupa teks.' }).default('')
	})
);
export const previewLessonRequestSchema = z.object({
	content: z.looseObject({
		content: z.string({ error: 'HTML lesson harus berupa teks.' }),
		tips: z.string({ error: 'Tips lesson harus berupa teks.' }).default('')
	})
});

const coreFields = { title, slug, order_index: integer('Urutan', 32767).optional() };
export const courseContentSchema = z.object({
	...coreFields,
	level_id: resourceIdSchema,
	description: z.string().nullable().optional(),
	thumbnail_url: mediaUrl
});
export const moduleContentSchema = z.object({
	...coreFields,
	course_id: resourceIdSchema,
	description: z.string().nullable().optional(),
	is_mandatory: z.boolean().optional(),
	is_entry: z.boolean().optional(),
	module_prerequisites: prerequisiteIds,
	estimated_minutes: integer('Estimasi waktu', 2147483647).nullable().optional()
});
export const lessonContentSchema = z.object({
	...coreFields,
	module_id: resourceIdSchema,
	is_entry: z.boolean().optional(),
	lesson_prerequisites: prerequisiteIds,
	content: adminLessonContentSchema
});

// Drafts may contain unfinished prompts, options and writing templates. Publication
// rules that depend on stored content remain enforced by the backend.
const questionDraftSchema = z.object({
	question_type: z.enum(['multiple_choice', 'stroke_writing']),
	prompt_text: z.string().optional(),
	stimulus_text: z.string().nullable().optional(),
	stimulus_media_url: mediaUrl,
	explanation: z.string().nullable().optional(),
	points: integer('Poin', 32767, -32768).optional(),
	stroke_template_id: resourceIdSchema.nullable().optional(),
	show_writing_guide: z.boolean().optional(),
	options: z
		.array(
			z.object({
				label: z.string(),
				media_url: mediaUrl,
				is_correct: z.boolean()
			})
		)
		.nullable()
		.optional()
});
export const questionSetContentSchema = z
	.object({
		title,
		kind: z.enum(['practice', 'final_exam'], { error: 'Jenis question set tidak valid.' }),
		lesson_id: resourceIdSchema.nullable().optional(),
		module_id: resourceIdSchema.nullable().optional(),
		skill: z.enum(['reading', 'writing'], { error: 'Skill harus reading atau writing.' }),
		passing_score: integer('Nilai kelulusan', 100),
		order_index: integer('Urutan', 32767).optional(),
		total_questions: integer('Jumlah soal', 32767, 1).nullable().optional(),
		time_limit_seconds: integer('Batas waktu', 2147483647).nullable().optional(),
		max_attempts: integer('Batas percobaan', 32767, 1).nullable().optional(),
		cooldown_minutes: integer('Jeda percobaan', 2147483647).optional(),
		shuffle_questions: z.boolean().optional(),
		questions: z.array(questionDraftSchema).nullable().optional()
	})
	.refine(
		(value) =>
			value.kind === 'practice'
				? Boolean(value.lesson_id) && value.module_id == null
				: Boolean(value.module_id) && value.lesson_id == null,
		'Pilih lesson untuk latihan atau module untuk ujian akhir.'
	);

export const adminContentSchemas = {
	course: courseContentSchema,
	module: moduleContentSchema,
	lesson: lessonContentSchema,
	question_set: questionSetContentSchema
} satisfies Record<AdminContentKind, z.ZodType>;

export const adminReorderRequestSchema = z.object({
	parent_id: resourceIdSchema,
	ordered_ids: z
		.array(resourceIdSchema)
		.max(32768, 'Jumlah konten maksimal 32768.')
		.refine(uniqueIds, 'ID konten tidak boleh duplikat.')
});
export const adminRoleSchema = z.enum(['User', 'Admin'], { error: 'Role tidak valid.' });
export const changeAdminRoleRequestSchema = z.object({ role: adminRoleSchema });

const metadataText = z
	.string({ error: 'Metadata template wajib diisi.' })
	.trim()
	.min(1, 'Metadata template wajib diisi.')
	.refine((value) => !value.includes('\0'), 'Metadata template berisi karakter tidak valid.');
export const kanaTemplateInputSchema = z
	.strictObject({
		script: z.enum(['hiragana', 'katakana'], { error: 'Pilih script hiragana atau katakana.' }),
		character: metadataText.transform((value) => value.normalize('NFC')),
		romaji: metadataText.refine((value) => [...value].length <= 8, 'Romaji maksimal 8 karakter.'),
		source_version: metadataText,
		svg_content: z
			.string({ error: 'SVG tidak valid.' })
			.refine((value) => new TextEncoder().encode(value).length <= MAX_KANA_SVG_BYTES, {
				message: 'Ukuran SVG maksimal 256 KiB.',
				params: { status: 413 }
			})
			.optional()
	})
	.refine(
		({ script, character }) =>
			[...character].length === 1 &&
			/^\p{Letter}$/u.test(character) &&
			(script === 'hiragana' ? /^\p{Script=Hiragana}$/u : /^\p{Script=Katakana}$/u).test(character),
		{ message: 'Karakter harus berupa satu kana sesuai script.', path: ['character'] }
	);
export const kanaTemplateUploadSchema = kanaTemplateInputSchema.refine(
	(value) => Boolean(value.svg_content?.trim()),
	{ message: 'File SVG KanjiVG wajib diunggah.', path: ['svg_content'] }
);
