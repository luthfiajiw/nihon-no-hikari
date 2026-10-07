import type { SubmitAttemptRequest, SubmitAttemptResponse } from '../entities/question.entity';
import type { QuestionRepository } from '../repositories/question.repository';

export class SubmitQuestionSetAttemptUseCase {
	constructor(private readonly questionRepository: QuestionRepository) {}

	exec(
		courseId: string,
		lessonId: string,
		questionSetId: string,
		attemptId: string,
		request: SubmitAttemptRequest
	): Promise<SubmitAttemptResponse> {
		return this.questionRepository.submitAttempt(
			courseId,
			lessonId,
			questionSetId,
			attemptId,
			request
		);
	}
}
