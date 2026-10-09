import { describe, expect, it, vi } from 'vitest';
import type { QuestionRepository } from '../repositories/question.repository';
import { AbandonQuestionSetAttemptUseCase } from './abandon-question-set-attempt.usecase';

describe('AbandonQuestionSetAttemptUseCase', () => {
	it('abandons the attempt through the repository', async () => {
		const repository: QuestionRepository = {
			getQuestionSetDetail: vi.fn(),
			startAttempt: vi.fn(),
			submitAttempt: vi.fn(),
			abandonAttempt: vi.fn().mockResolvedValue(undefined)
		};
		const useCase = new AbandonQuestionSetAttemptUseCase(repository);

		await expect(useCase.exec('course-1', 'lesson-1', 'set-1', 'attempt-1')).resolves.toBe(
			undefined
		);
		expect(repository.abandonAttempt).toHaveBeenCalledWith(
			'course-1',
			'lesson-1',
			'set-1',
			'attempt-1'
		);
	});
});
