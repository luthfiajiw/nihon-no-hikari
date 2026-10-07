import type { QuestionSetDetailResponse } from '../../domain/entities/question.entity';
import type { QuestionRepository } from '../../domain/repositories/question.repository';
import { QuestionSource } from '../sources/question.source';

export class QuestionRepositoryImpl implements QuestionRepository {
	constructor(private readonly questionSource: QuestionSource) {}

	getQuestionSetDetail(
		courseId: string,
		lessonId: string,
		questionSetId: string
	): Promise<QuestionSetDetailResponse> {
		return this.questionSource.getQuestionSetDetail(courseId, lessonId, questionSetId);
	}
}
