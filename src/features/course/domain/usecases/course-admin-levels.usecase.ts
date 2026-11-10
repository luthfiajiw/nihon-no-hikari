import { z } from 'zod';
import { HttpError } from '$lib/http/http-error';
import { integer } from '$lib/content-validation';
import type { CourseAdminLevel, CourseAdminLevelInput } from '../entities/course-admin.entity';
import type { CourseAdminRepository } from '../repositories/course-admin.repository';

const levelIdSchema = z
	.guid({ error: 'ID level tidak valid.' })
	.refine((value) => value !== '00000000-0000-0000-0000-000000000000', 'ID level tidak valid.');

const levelPriceSchema = z.object({
	price: integer('Harga level', 100_000_000, 0)
});

const levelInputSchema = z.object({
	code: z
		.string({ error: 'Kode level harus diisi.' })
		.trim()
		.min(1, 'Kode level harus diisi.')
		.max(8, 'Kode level maksimal 8 karakter.'),
	name: z
		.string({ error: 'Nama level harus diisi.' })
		.trim()
		.min(1, 'Nama level harus diisi.')
		.max(100, 'Nama level maksimal 100 karakter.'),
	tag: z
		.string()
		.trim()
		.max(40, 'Tag level maksimal 40 karakter.')
		.nullable()
		.optional()
		.transform((v) => (v ? v : null)),
	description: z
		.string()
		.trim()
		.nullable()
		.optional()
		.transform((v) => (v ? v : null)),
	order_index: integer('Urutan level', 32767, 0),
	price: integer('Harga level', 100_000_000, 0),
	points: z
		.array(
			z
				.string()
				.trim()
				.min(1, 'Poin tidak boleh kosong.')
				.max(160, 'Setiap poin maksimal 160 karakter.')
		)
		.max(20, 'Maksimal 20 poin per level.')
		.default([])
});

export class GetCourseAdminLevelsUseCase {
	constructor(private readonly repository: CourseAdminRepository) {}

	exec(): Promise<CourseAdminLevel[]> {
		return this.repository.getAdminLevels();
	}
}

export class GetCourseAdminLevelEditorUseCase {
	constructor(private readonly repository: CourseAdminRepository) {}

	async exec(id: string): Promise<CourseAdminLevel> {
		if (id === 'new') {
			return {
				id: 'new',
				code: '',
				name: '',
				tag: null,
				description: '',
				price: 0,
				points: [],
				order_index: 0
			};
		}
		const idResult = levelIdSchema.safeParse(id);
		if (!idResult.success) {
			throw new HttpError(400, 'ID level tidak valid.');
		}
		return this.repository.getAdminLevel(id);
	}
}

export class SaveCourseAdminLevelUseCase {
	constructor(private readonly repository: CourseAdminRepository) {}

	async exec(id: string, rawInput: unknown): Promise<CourseAdminLevel> {
		const isNew = id === 'new';
		if (!isNew) {
			const idResult = levelIdSchema.safeParse(id);
			if (!idResult.success) {
				throw new HttpError(400, 'ID level tidak valid.');
			}
		}

		// Filter out empty points if array is passed
		let sanitizedInput = rawInput;
		if (typeof rawInput === 'object' && rawInput !== null && 'points' in rawInput) {
			const candidate = (rawInput as { points?: unknown }).points;
			if (Array.isArray(candidate)) {
				sanitizedInput = {
					...rawInput,
					points: candidate
						.filter((p) => typeof p === 'string' && p.trim() !== '')
						.map((p) => (p as string).trim())
				};
			}
		}

		const parsed = levelInputSchema.safeParse(sanitizedInput);
		if (!parsed.success) {
			const issue = parsed.error.issues[0]?.message ?? 'Data level tidak valid.';
			throw new HttpError(400, issue);
		}
		const input: CourseAdminLevelInput = parsed.data;
		if (isNew) {
			return this.repository.createAdminLevel(input);
		}
		return this.repository.updateAdminLevel(id, input);
	}
}

export class DeleteCourseAdminLevelUseCase {
	constructor(private readonly repository: CourseAdminRepository) {}

	async exec(id: string): Promise<void> {
		const idResult = levelIdSchema.safeParse(id);
		if (!idResult.success) {
			throw new HttpError(400, 'ID level tidak valid.');
		}
		return this.repository.deleteAdminLevel(id);
	}
}

export class UpdateCourseAdminLevelPriceUseCase {
	constructor(private readonly repository: CourseAdminRepository) {}

	async exec(id: string, price: number): Promise<CourseAdminLevel> {
		const idResult = levelIdSchema.safeParse(id);
		if (!idResult.success) {
			throw new HttpError(400, 'ID level tidak valid.');
		}

		const priceResult = levelPriceSchema.safeParse({ price });
		if (!priceResult.success) {
			const issue = priceResult.error.issues[0]?.message ?? 'Harga level tidak valid.';
			throw new HttpError(400, issue);
		}

		return this.repository.updateAdminLevelPrice(id, price);
	}
}
