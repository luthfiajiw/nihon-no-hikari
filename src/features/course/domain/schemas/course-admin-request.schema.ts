import { z } from 'zod';
import { resourceIdSchema, uniqueIds } from '$lib/server/validation';
import { integer, title, slug, mediaUrl } from '$lib/content-validation';
import type { CourseAdminContentKind } from '../entities/course-admin.entity';
const prerequisiteIds = z
	.array(resourceIdSchema)
	.refine(uniqueIds, 'ID prasyarat tidak boleh duplikat.')
	.nullable()
	.optional();

// Preserve additional lesson metadata and accept legacy HTML stored as a string.
export const courseAdminLessonBodySchema = z.preprocess(
	(value) => (typeof value === 'string' ? { content: value, tips: '' } : (value ?? {})),
	z.looseObject({
		content: z.string({ error: 'HTML lesson harus berupa teks.' }).default(''),
		tips: z.string({ error: 'Tips lesson harus berupa teks.' }).default('')
	})
);
export const courseAdminPreviewLessonRequestSchema = z.object({
	content: z.looseObject({
		content: z.string({ error: 'HTML lesson harus berupa teks.' }),
		tips: z.string({ error: 'Tips lesson harus berupa teks.' }).default('')
	})
});

const coreFields = { title, slug, order_index: integer('Urutan', 32767).optional() };
export const courseAdminCourseContentSchema = z.object({
	...coreFields,
	level_id: resourceIdSchema,
	description: z.string().nullable().optional(),
	thumbnail_url: mediaUrl
});
export const courseAdminModuleContentSchema = z.object({
	...coreFields,
	course_id: resourceIdSchema,
	description: z.string().nullable().optional(),
	is_mandatory: z.boolean().optional(),
	is_entry: z.boolean().optional(),
	module_prerequisites: prerequisiteIds,
	estimated_minutes: integer('Estimasi waktu', 2147483647).nullable().optional()
});
export const courseAdminLessonContentSchema = z.object({
	...coreFields,
	module_id: resourceIdSchema,
	is_entry: z.boolean().optional(),
	lesson_prerequisites: prerequisiteIds,
	content: courseAdminLessonBodySchema
});

export const courseAdminReorderRequestSchema = z.object({
	parent_id: resourceIdSchema,
	ordered_ids: z
		.array(resourceIdSchema)
		.max(32768, 'Jumlah konten maksimal 32768.')
		.refine(uniqueIds, 'ID konten tidak boleh duplikat.')
});

export const courseAdminContentSchemas = {
	course: courseAdminCourseContentSchema,
	module: courseAdminModuleContentSchema,
	lesson: courseAdminLessonContentSchema
} satisfies Record<CourseAdminContentKind, z.ZodType>;
