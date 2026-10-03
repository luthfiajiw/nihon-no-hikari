import { describe, expect, it, vi } from 'vitest';
import type { CourseDetailResponse } from '../entities/course.entity';
import type { CourseRepository } from '../repositories/course.repository';
import { GetCourseDetailUseCase } from './get-course-detail.usecase';

describe('GetCourseDetailUseCase', () => {
	it('returns the course detail from the repository', async () => {
		const response: CourseDetailResponse = {
			success: true,
			message: 'OK',
			data: {
				id: 'course-1',
				slug: 'jlpt-n5',
				title: 'JLPT N5',
				description: 'Dasar bahasa Jepang',
				total_minutes: 120,
				total_lessons: 2,
				level: { id: 'level-1', code: 'N5', name: 'Pemula' },
				modules: []
			}
		};
		const repository: CourseRepository = {
			getList: vi.fn(),
			getDetail: vi.fn().mockResolvedValue(response),
			getModules: vi.fn(),
			getLesson: vi.fn(),
			updateModuleProgress: vi.fn(),
			updateLessonProgress: vi.fn()
		};
		const useCase = new GetCourseDetailUseCase(repository);

		await expect(useCase.exec('course-1')).resolves.toEqual(response);
		expect(repository.getDetail).toHaveBeenCalledWith('course-1');
	});
});
