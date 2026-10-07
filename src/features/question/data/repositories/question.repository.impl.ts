import type {
	AttemptResponse,
	QuestionSetDetailResponse,
	SubmitAttemptRequest,
	SubmitAttemptResponse
} from '../../domain/entities/question.entity';
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

	startAttempt(
		courseId: string,
		lessonId: string,
		questionSetId: string
	): Promise<AttemptResponse> {
		return this.questionSource.startAttempt(courseId, lessonId, questionSetId);
	}

	submitAttempt(
		courseId: string,
		lessonId: string,
		questionSetId: string,
		attemptId: string,
		request: SubmitAttemptRequest
	): Promise<SubmitAttemptResponse> {
		return this.questionSource.submitAttempt(courseId, lessonId, questionSetId, attemptId, request);
	}
}
