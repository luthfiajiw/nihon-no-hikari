import { describe, expect, it, vi } from 'vitest';
import type { CourseRepository } from '../repositories/course.repository';
import { UpdateModuleProgressUseCase } from './update-module-progress.usecase';

describe('UpdateModuleProgressUseCase', () => {
	it.each(['in_progress', 'completed'] as const)('forwards the %s status', async (status) => {
		const response = { success: true, message: 'OK' };
		const repository: CourseRepository = {
			getList: vi.fn(),
			getDetail: vi.fn(),
			getModules: vi.fn(),
			getLesson: vi.fn(),
			updateModuleProgress: vi.fn().mockResolvedValue(response),
			updateLessonProgress: vi.fn()
		};
		const useCase = new UpdateModuleProgressUseCase(repository);

		await expect(useCase.exec('course-1', 'module-1', { status })).resolves.toEqual(response);
		expect(repository.updateModuleProgress).toHaveBeenCalledWith('course-1', 'module-1', {
			status
		});
	});
});
