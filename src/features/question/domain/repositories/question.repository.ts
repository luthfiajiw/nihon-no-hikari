import type { QuestionSetDetailResponse } from '../entities/question.entity';

export interface QuestionRepository {
	getQuestionSetDetail(
		courseId: string,
		lessonId: string,
		questionSetId: string
	): Promise<QuestionSetDetailResponse>;
}
