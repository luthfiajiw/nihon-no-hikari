import type { QuestionSetDetailResponse } from '../entities/question.entity';
import type { QuestionRepository } from '../repositories/question.repository';

export class GetQuestionSetDetailUseCase {
	constructor(private readonly questionRepository: QuestionRepository) {}

	exec(questionSetId: string): Promise<QuestionSetDetailResponse> {
		return this.questionRepository.getQuestionSetDetail(questionSetId);
	}
}
