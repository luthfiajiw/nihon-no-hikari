import type { AttemptResponse } from '../entities/question.entity';
import type { QuestionRepository } from '../repositories/question.repository';

export class StartQuestionSetAttemptUseCase {
	constructor(private readonly questionRepository: QuestionRepository) {}

	exec(questionSetId: string): Promise<AttemptResponse> {
		return this.questionRepository.startAttempt(questionSetId);
	}
}
