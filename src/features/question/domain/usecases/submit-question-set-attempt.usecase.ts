import type { SubmitAttemptRequest, SubmitAttemptResponse } from '../entities/question.entity';
import type { QuestionRepository } from '../repositories/question.repository';

export class SubmitQuestionSetAttemptUseCase {
	constructor(private readonly questionRepository: QuestionRepository) {}

	exec(
		questionSetId: string,
		attemptId: string,
		request: SubmitAttemptRequest
	): Promise<SubmitAttemptResponse> {
		return this.questionRepository.submitAttempt(questionSetId, attemptId, request);
	}
}
