import { describe, expect, it, vi } from 'vitest';
import type { AttemptResponse } from '../entities/question.entity';
import type { QuestionRepository } from '../repositories/question.repository';
import { StartQuestionSetAttemptUseCase } from './start-question-set-attempt.usecase';

describe('StartQuestionSetAttemptUseCase', () => {
	it('returns the attempt from the repository', async () => {
		const response = { success: true, message: 'OK' } as AttemptResponse;
		const repository: QuestionRepository = {
			getQuestionSetDetail: vi.fn(),
			startAttempt: vi.fn().mockResolvedValue(response),
			submitAttempt: vi.fn(),
			abandonAttempt: vi.fn()
		};
		const useCase = new StartQuestionSetAttemptUseCase(repository);

		await expect(useCase.exec('course-1', 'lesson-1', 'set-1')).resolves.toEqual(response);
		expect(repository.startAttempt).toHaveBeenCalledWith('course-1', 'lesson-1', 'set-1');
	});
});
