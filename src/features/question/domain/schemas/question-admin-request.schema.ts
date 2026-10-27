import { z } from 'zod';
import { resourceIdSchema } from '$lib/server/validation';
import { integer, title, mediaUrl } from '$lib/content-validation';
import { QUESTION_MAX_KANA_SVG_BYTES } from '../entities/question-kana-template.entity';
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
export const questionAdminSetContentSchema = z
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

const metadataText = z
	.string({ error: 'Metadata template wajib diisi.' })
	.trim()
	.min(1, 'Metadata template wajib diisi.')
	.refine((value) => !value.includes('\0'), 'Metadata template berisi karakter tidak valid.');
export const questionKanaTemplateInputSchema = z
	.strictObject({
		script: z.enum(['hiragana', 'katakana'], { error: 'Pilih script hiragana atau katakana.' }),
		character: metadataText.transform((value) => value.normalize('NFC')),
		romaji: metadataText.refine((value) => [...value].length <= 8, 'Romaji maksimal 8 karakter.'),
		source_version: metadataText,
		svg_content: z
			.string({ error: 'SVG tidak valid.' })
			.refine((value) => new TextEncoder().encode(value).length <= QUESTION_MAX_KANA_SVG_BYTES, {
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
export const questionKanaTemplateUploadSchema = questionKanaTemplateInputSchema.refine(
	(value) => Boolean(value.svg_content?.trim()),
	{ message: 'File SVG KanjiVG wajib diunggah.', path: ['svg_content'] }
);
