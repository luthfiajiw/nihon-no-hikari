import { QuestionRepositoryImpl } from '$features/question/data/repositories/question.repository.impl';
import { QuestionSource } from '$features/question/data/sources/question.source';
import { GetQuestionSetDetailUseCase } from '$features/question/domain/usecases/get-question-set-detail.usecase';
import { apiClient } from './api.dependency';

const questionSource = new QuestionSource(apiClient);
const questionRepository = new QuestionRepositoryImpl(questionSource);

export const getQuestionSetDetailUseCase = new GetQuestionSetDetailUseCase(questionRepository);
