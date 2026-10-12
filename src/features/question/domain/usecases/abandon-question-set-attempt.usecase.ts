import type { QuestionRepository } from '../repositories/question.repository';

export class AbandonQuestionSetAttemptUseCase {
	constructor(private readonly questionRepository: QuestionRepository) {}

	exec(
		questionSetId: string,
		attemptId: string
	): Promise<void> {
		return this.questionRepository.abandonAttempt(questionSetId, attemptId);
	}
}
