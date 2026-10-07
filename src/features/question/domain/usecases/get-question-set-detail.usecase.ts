import type { QuestionSetDetailResponse } from '../entities/question.entity';
import type { QuestionRepository } from '../repositories/question.repository';

export class GetQuestionSetDetailUseCase {
	constructor(private readonly questionRepository: QuestionRepository) {}

	exec(
		courseId: string,
		lessonId: string,
		questionSetId: string
	): Promise<QuestionSetDetailResponse> {
		return this.questionRepository.getQuestionSetDetail(courseId, lessonId, questionSetId);
	}
}
