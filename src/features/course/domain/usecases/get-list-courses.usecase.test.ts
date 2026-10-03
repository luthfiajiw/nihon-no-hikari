import { describe, expect, it, vi } from 'vitest';
import type { CourseRepository } from '../repositories/course.repository';
import { GetListCoursesUseCase } from './get-list-courses.usecase';

describe('GetListCoursesUseCase', () => {
	it('returns the response from the repository', async () => {
		const response = { success: true, message: 'OK', data: [] };
		const repository: CourseRepository = {
			getList: vi.fn().mockResolvedValue(response),
			getDetail: vi.fn(),
			updateModuleProgress: vi.fn()
		};
		const useCase = new GetListCoursesUseCase(repository);

		await expect(useCase.exec()).resolves.toEqual(response);
		expect(repository.getList).toHaveBeenCalledOnce();
	});
});
