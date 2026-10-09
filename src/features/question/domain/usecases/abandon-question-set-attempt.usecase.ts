import type { QuestionRepository } from '../repositories/question.repository';

export class AbandonQuestionSetAttemptUseCase {
	constructor(private readonly questionRepository: QuestionRepository) {}

	exec(
		courseId: string,
		lessonId: string,
		questionSetId: string,
		attemptId: string
	): Promise<void> {
		return this.questionRepository.abandonAttempt(courseId, lessonId, questionSetId, attemptId);
	}
}
