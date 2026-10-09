import { QuestionRepositoryImpl } from '$features/question/data/repositories/question.repository.impl';
import { QuestionSource } from '$features/question/data/sources/question.source';
import { AbandonQuestionSetAttemptUseCase } from '$features/question/domain/usecases/abandon-question-set-attempt.usecase';
import { GetQuestionSetDetailUseCase } from '$features/question/domain/usecases/get-question-set-detail.usecase';
import { StartQuestionSetAttemptUseCase } from '$features/question/domain/usecases/start-question-set-attempt.usecase';
import { SubmitQuestionSetAttemptUseCase } from '$features/question/domain/usecases/submit-question-set-attempt.usecase';
import { apiClient } from './api.dependency';

const questionSource = new QuestionSource(apiClient);
const questionRepository = new QuestionRepositoryImpl(questionSource);

export const getQuestionSetDetailUseCase = new GetQuestionSetDetailUseCase(questionRepository);
export const startQuestionSetAttemptUseCase = new StartQuestionSetAttemptUseCase(
	questionRepository
);
export const submitQuestionSetAttemptUseCase = new SubmitQuestionSetAttemptUseCase(
	questionRepository
);
export const abandonQuestionSetAttemptUseCase = new AbandonQuestionSetAttemptUseCase(
	questionRepository
);
