import { describe, expect, it, vi } from 'vitest';
import type { ListModuleLessonResponse } from '../entities/lesson.entity';
import type { CourseRepository } from '../repositories/course.repository';
import { GetCourseModulesUseCase } from './get-course-modules.usecase';

describe('GetCourseModulesUseCase', () => {
	it('returns the course modules and lessons from the repository', async () => {
		const response: ListModuleLessonResponse = {
			success: true,
			message: 'OK',
			data: []
		};
		const repository: CourseRepository = {
			getList: vi.fn(),
			getDetail: vi.fn(),
			getModules: vi.fn().mockResolvedValue(response),
			getLesson: vi.fn(),
			updateModuleProgress: vi.fn()
		};
		const useCase = new GetCourseModulesUseCase(repository);

		await expect(useCase.exec('course-1')).resolves.toEqual(response);
		expect(repository.getModules).toHaveBeenCalledWith('course-1');
	});
});
