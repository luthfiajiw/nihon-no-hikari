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

	getQuestionSetDetail(questionSetId: string): Promise<QuestionSetDetailResponse> {
		return this.questionSource.getQuestionSetDetail(questionSetId);
	}

	startAttempt(questionSetId: string): Promise<AttemptResponse> {
		return this.questionSource.startAttempt(questionSetId);
	}

	submitAttempt(
		questionSetId: string,
		attemptId: string,
		request: SubmitAttemptRequest
	): Promise<SubmitAttemptResponse> {
		return this.questionSource.submitAttempt(questionSetId, attemptId, request);
	}

	abandonAttempt(
		questionSetId: string,
		attemptId: string
	): Promise<void> {
		return this.questionSource.abandonAttempt(questionSetId, attemptId);
	}
}
