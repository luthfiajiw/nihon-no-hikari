import type { AttemptResponse } from '../entities/question.entity';
import type { QuestionRepository } from '../repositories/question.repository';

export class StartQuestionSetAttemptUseCase {
	constructor(private readonly questionRepository: QuestionRepository) {}

	exec(courseId: string, lessonId: string, questionSetId: string): Promise<AttemptResponse> {
		return this.questionRepository.startAttempt(courseId, lessonId, questionSetId);
	}
}
