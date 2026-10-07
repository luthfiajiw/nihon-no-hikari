import { describe, expect, it, vi } from 'vitest';
import type { QuestionSetDetailResponse } from '../entities/question.entity';
import type { QuestionRepository } from '../repositories/question.repository';
import { GetQuestionSetDetailUseCase } from './get-question-set-detail.usecase';

describe('GetQuestionSetDetailUseCase', () => {
	it('returns the question set detail from the repository', async () => {
		const response: QuestionSetDetailResponse = {
			success: true,
			message: 'OK',
			data: {
				id: 'set-1',
				title: 'Hiragana',
				kind: 'practice',
				passing_score: 80,
				question_count: 0,
				cooldown_minutes: 0,
				shuffle_questions: false,
				is_passed: false,
				attempts_used: 0,
				questions: []
			}
		};
		const repository: QuestionRepository = {
			getQuestionSetDetail: vi.fn().mockResolvedValue(response)
		};
		const useCase = new GetQuestionSetDetailUseCase(repository);

		await expect(useCase.exec('course-1', 'lesson-1', 'set-1')).resolves.toEqual(response);
		expect(repository.getQuestionSetDetail).toHaveBeenCalledWith('course-1', 'lesson-1', 'set-1');
	});
});
