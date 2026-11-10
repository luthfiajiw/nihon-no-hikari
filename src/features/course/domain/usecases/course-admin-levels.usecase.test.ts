import { describe, expect, it, vi } from 'vitest';
import type { CourseAdminRepository } from '../repositories/course-admin.repository';
import {
	GetCourseAdminLevelsUseCase,
	UpdateCourseAdminLevelPriceUseCase,
	GetCourseAdminLevelEditorUseCase,
	SaveCourseAdminLevelUseCase,
	DeleteCourseAdminLevelUseCase
} from './course-admin-levels.usecase';

function fixture() {
	return {
		reorderAdminContent: vi.fn(),
		getAdminCatalog: vi.fn(),
		getAdminContentList: vi.fn(),
		getAdminContent: vi.fn(),
		getAdminLevels: vi.fn().mockResolvedValue([
			{ id: '11111111-1111-4111-8111-111111111111', code: 'N5', name: 'N5', order_index: 0, price: 0, points: [] }
		]),
		updateAdminLevelPrice: vi.fn().mockResolvedValue({
			id: '11111111-1111-4111-8111-111111111111',
			code: 'N5',
			name: 'N5',
			order_index: 0,
			price: 149000,
			points: []
		}),
		saveAdminContent: vi.fn(),
		publishAdminContent: vi.fn(),
		removeAdminContent: vi.fn(),
		restoreAdminContent: vi.fn(),
		previewAdminLesson: vi.fn(),
		getAdminLevel: vi.fn().mockResolvedValue({
			id: '11111111-1111-4111-8111-111111111111',
			code: 'N5',
			name: 'JLPT N5',
			order_index: 0,
			price: 49000,
			points: ['Poin 1']
		}),
		createAdminLevel: vi.fn().mockResolvedValue({
			id: '22222222-2222-4222-8222-222222222222',
			code: 'N6',
			name: 'JLPT N6',
			order_index: 5,
			price: 29000,
			points: ['Dasar baru']
		}),
		updateAdminLevel: vi.fn().mockResolvedValue({
			id: '11111111-1111-4111-8111-111111111111',
			code: 'N5',
			name: 'JLPT N5 Updated',
			order_index: 0,
			price: 59000,
			points: ['Poin 1', 'Poin 2']
		}),
		deleteAdminLevel: vi.fn().mockResolvedValue(undefined)
	} satisfies CourseAdminRepository;
}

describe('GetCourseAdminLevelsUseCase', () => {
	it('loads administrative levels', async () => {
		const repo = fixture();
		const result = await new GetCourseAdminLevelsUseCase(repo).exec();
		expect(repo.getAdminLevels).toHaveBeenCalledOnce();
		expect(result).toHaveLength(1);
		expect(result[0].code).toBe('N5');
	});
});

describe('UpdateCourseAdminLevelPriceUseCase', () => {
	const validId = '11111111-1111-4111-8111-111111111111';

	it('updates level price with valid input', async () => {
		const repo = fixture();
		const result = await new UpdateCourseAdminLevelPriceUseCase(repo).exec(validId, 149000);
		expect(repo.updateAdminLevelPrice).toHaveBeenCalledWith(validId, 149000);
		expect(result.price).toBe(149000);
	});

	it('rejects invalid uuid', async () => {
		const repo = fixture();
		await expect(
			new UpdateCourseAdminLevelPriceUseCase(repo).exec('bad-id', 149000)
		).rejects.toMatchObject({
			status: 400,
			message: 'ID level tidak valid.'
		});
		expect(repo.updateAdminLevelPrice).not.toHaveBeenCalled();
	});

	it('rejects negative price', async () => {
		const repo = fixture();
		await expect(
			new UpdateCourseAdminLevelPriceUseCase(repo).exec(validId, -1)
		).rejects.toMatchObject({
			status: 400
		});
		expect(repo.updateAdminLevelPrice).not.toHaveBeenCalled();
	});

	it('rejects price exceeding 100,000,000', async () => {
		const repo = fixture();
		await expect(
			new UpdateCourseAdminLevelPriceUseCase(repo).exec(validId, 100000001)
		).rejects.toMatchObject({
			status: 400
		});
		expect(repo.updateAdminLevelPrice).not.toHaveBeenCalled();
	});
});

describe('GetCourseAdminLevelEditorUseCase', () => {
	const validId = '11111111-1111-4111-8111-111111111111';

	it('returns template for new level', async () => {
		const repo = fixture();
		const result = await new GetCourseAdminLevelEditorUseCase(repo).exec('new');
		expect(repo.getAdminLevel).not.toHaveBeenCalled();
		expect(result.id).toBe('new');
		expect(result.code).toBe('');
		expect(result.points).toEqual([]);
	});

	it('fetches existing level for valid uuid', async () => {
		const repo = fixture();
		const result = await new GetCourseAdminLevelEditorUseCase(repo).exec(validId);
		expect(repo.getAdminLevel).toHaveBeenCalledWith(validId);
		expect(result.code).toBe('N5');
	});

	it('rejects invalid id that is not new or uuid', async () => {
		const repo = fixture();
		await expect(
			new GetCourseAdminLevelEditorUseCase(repo).exec('invalid-id')
		).rejects.toMatchObject({
			status: 400
		});
	});
});

describe('SaveCourseAdminLevelUseCase', () => {
	const validId = '11111111-1111-4111-8111-111111111111';
	const validPayload = {
		code: 'N5',
		name: 'JLPT N5',
		tag: null,
		description: 'Deskripsi',
		price: 49000,
		points: ['Poin 1', 'Poin 2'],
		order_index: 0
	};

	it('creates level when id is new', async () => {
		const repo = fixture();
		const result = await new SaveCourseAdminLevelUseCase(repo).exec('new', validPayload);
		expect(repo.createAdminLevel).toHaveBeenCalledWith(validPayload);
		expect(result.id).toBe('22222222-2222-4222-8222-222222222222');
	});

	it('updates level when id is valid uuid', async () => {
		const repo = fixture();
		const result = await new SaveCourseAdminLevelUseCase(repo).exec(validId, validPayload);
		expect(repo.updateAdminLevel).toHaveBeenCalledWith(validId, validPayload);
		expect(result.name).toBe('JLPT N5 Updated');
	});

	it('rejects validation when code is empty', async () => {
		const repo = fixture();
		await expect(
			new SaveCourseAdminLevelUseCase(repo).exec('new', { ...validPayload, code: '' })
		).rejects.toMatchObject({
			status: 400
		});
	});
});

describe('DeleteCourseAdminLevelUseCase', () => {
	const validId = '11111111-1111-4111-8111-111111111111';

	it('deletes level with valid uuid', async () => {
		const repo = fixture();
		await new DeleteCourseAdminLevelUseCase(repo).exec(validId);
		expect(repo.deleteAdminLevel).toHaveBeenCalledWith(validId);
	});

	it('rejects invalid uuid', async () => {
		const repo = fixture();
		await expect(
			new DeleteCourseAdminLevelUseCase(repo).exec('bad-id')
		).rejects.toMatchObject({
			status: 400
		});
	});
});
