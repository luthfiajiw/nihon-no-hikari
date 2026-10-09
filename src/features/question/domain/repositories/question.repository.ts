import type {
	AttemptResponse,
	QuestionSetDetailResponse,
	SubmitAttemptRequest,
	SubmitAttemptResponse
} from '../entities/question.entity';

export interface QuestionRepository {
	getQuestionSetDetail(
		courseId: string,
		lessonId: string,
		questionSetId: string
	): Promise<QuestionSetDetailResponse>;
	startAttempt(courseId: string, lessonId: string, questionSetId: string): Promise<AttemptResponse>;
	submitAttempt(
		courseId: string,
		lessonId: string,
		questionSetId: string,
		attemptId: string,
		request: SubmitAttemptRequest
	): Promise<SubmitAttemptResponse>;
	abandonAttempt(
		courseId: string,
		lessonId: string,
		questionSetId: string,
		attemptId: string
	): Promise<void>;
}
