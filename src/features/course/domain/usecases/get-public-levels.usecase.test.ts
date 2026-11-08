import { describe, expect, it, vi } from 'vitest';
import type { CourseRepository } from '../repositories/course.repository';
import { GetPublicLevelsUseCase } from './get-public-levels.usecase';

function fixture() {
	return {
		getList: vi.fn(),
		getDetail: vi.fn(),
		getModules: vi.fn(),
		getLesson: vi.fn(),
		updateModuleProgress: vi.fn(),
		updateLessonProgress: vi.fn(),
		getPublicLevels: vi.fn().mockResolvedValue([
			{ id: '11111111-1111-4111-8111-111111111111', code: 'N5', name: 'N5', order_index: 0, price: 0 }
		])
	} satisfies CourseRepository;
}

describe('GetPublicLevelsUseCase', () => {
	it('fetches public levels', async () => {
		const repo = fixture();
		const result = await new GetPublicLevelsUseCase(repo).exec();
		expect(repo.getPublicLevels).toHaveBeenCalledOnce();
		expect(result).toHaveLength(1);
		expect(result[0].price).toBe(0);
	});
});
