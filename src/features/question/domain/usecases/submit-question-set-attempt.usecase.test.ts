import { describe, expect, it, vi } from 'vitest';
import type { SubmitAttemptRequest, SubmitAttemptResponse } from '../entities/question.entity';
import type { QuestionRepository } from '../repositories/question.repository';
import { SubmitQuestionSetAttemptUseCase } from './submit-question-set-attempt.usecase';

describe('SubmitQuestionSetAttemptUseCase', () => {
	it('submits answers through the repository', async () => {
		const request: SubmitAttemptRequest = {
			answers: [
				{
					question_id: 'question-1',
					selected_option_id: 'option-1',
					stroke_input: null
				}
			]
		};
		const response = {
			success: true,
			message: 'Jawaban berhasil dikirim.'
		} as SubmitAttemptResponse;
		const repository: QuestionRepository = {
			getQuestionSetDetail: vi.fn(),
			startAttempt: vi.fn(),
			submitAttempt: vi.fn().mockResolvedValue(response),
			abandonAttempt: vi.fn()
		};
		const useCase = new SubmitQuestionSetAttemptUseCase(repository);

		await expect(
			useCase.exec('course-1', 'lesson-1', 'set-1', 'attempt-1', request)
		).resolves.toEqual(response);
		expect(repository.submitAttempt).toHaveBeenCalledWith(
			'course-1',
			'lesson-1',
			'set-1',
			'attempt-1',
			request
		);
	});
});
