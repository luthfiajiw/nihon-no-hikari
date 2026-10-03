import { describe, expect, it, vi } from 'vitest';
import type { LessonDetailResponse } from '../entities/lesson.entity';
import type { CourseRepository } from '../repositories/course.repository';
import { GetLessonDetailUseCase } from './get-lesson-detail.usecase';

describe('GetLessonDetailUseCase', () => {
	it('returns the lesson detail from the repository', async () => {
		const response: LessonDetailResponse = {
			success: true,
			message: 'OK',
			data: {
				id: 'lesson-1',
				slug: 'vokal-dasar',
				title: 'Vokal Dasar',
				content: '<p>Materi</p>',
				status: 'in_progress'
			}
		};
		const repository: CourseRepository = {
			getList: vi.fn(),
			getDetail: vi.fn(),
			getModules: vi.fn(),
			getLesson: vi.fn().mockResolvedValue(response),
			updateModuleProgress: vi.fn()
		};
		const useCase = new GetLessonDetailUseCase(repository);

		await expect(useCase.exec('course-1', 'lesson-1')).resolves.toEqual(response);
		expect(repository.getLesson).toHaveBeenCalledWith('course-1', 'lesson-1');
	});
});
