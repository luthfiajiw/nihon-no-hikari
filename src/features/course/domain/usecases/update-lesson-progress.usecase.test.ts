import { describe, expect, it, vi } from 'vitest';
import type { CourseRepository } from '../repositories/course.repository';
import { UpdateLessonProgressUseCase } from './update-lesson-progress.usecase';

describe('UpdateLessonProgressUseCase', () => {
	it.each(['unlocked', 'in_progress', 'completed'] as const)(
		'forwards the %s status',
		async (status) => {
			const response = { success: true, message: 'OK' };
			const repository: CourseRepository = {
				getList: vi.fn(),
				getDetail: vi.fn(),
				getModules: vi.fn(),
				getLesson: vi.fn(),
				updateModuleProgress: vi.fn(),
				updateLessonProgress: vi.fn().mockResolvedValue(response)
			};
			const useCase = new UpdateLessonProgressUseCase(repository);

			await expect(useCase.exec('course-1', 'lesson-1', { status })).resolves.toEqual(response);
			expect(repository.updateLessonProgress).toHaveBeenCalledWith('course-1', 'lesson-1', {
				status
			});
		}
	);
});
