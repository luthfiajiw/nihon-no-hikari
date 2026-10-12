import type {
	AttemptResponse,
	QuestionSetDetailResponse,
	SubmitAttemptRequest,
	SubmitAttemptResponse
} from '../entities/question.entity';

export interface QuestionRepository {
	getQuestionSetDetail(questionSetId: string): Promise<QuestionSetDetailResponse>;
	startAttempt(questionSetId: string): Promise<AttemptResponse>;
	submitAttempt(
		questionSetId: string,
		attemptId: string,
		request: SubmitAttemptRequest
	): Promise<SubmitAttemptResponse>;
	abandonAttempt(
		questionSetId: string,
		attemptId: string
	): Promise<void>;
}
