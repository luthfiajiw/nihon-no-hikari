import { QuestionKanaTemplatesUseCase } from '$features/question/domain/usecases/question-kana-templates.usecase';
import { GetQuestionAdminSetsUseCase } from '$features/question/domain/usecases/question-admin-list.usecase';
import { ManageQuestionAdminContentUseCase } from '$features/question/domain/usecases/question-admin-content.usecase';
import { GetQuestionAdminEditorUseCase } from '$features/question/domain/usecases/question-admin-editor.usecase';
import { courseAdminCatalogReader } from './course.dependency';
import { requestFetch } from '#request-fetch';
import { QuestionRepositoryImpl } from '$features/question/data/repositories/question.repository.impl';
import { QuestionSource } from '$features/question/data/sources/question.source';
import { AbandonQuestionSetAttemptUseCase } from '$features/question/domain/usecases/abandon-question-set-attempt.usecase';
import { GetQuestionSetDetailUseCase } from '$features/question/domain/usecases/get-question-set-detail.usecase';
import { StartQuestionSetAttemptUseCase } from '$features/question/domain/usecases/start-question-set-attempt.usecase';
import { SubmitQuestionSetAttemptUseCase } from '$features/question/domain/usecases/submit-question-set-attempt.usecase';

const questionSource = new QuestionSource(requestFetch);
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

export const getQuestionAdminEditorUseCase = new GetQuestionAdminEditorUseCase(
	questionRepository,
	courseAdminCatalogReader
);

export const manageQuestionAdminContentUseCase = new ManageQuestionAdminContentUseCase(
	questionRepository
);

export const getQuestionAdminSetsUseCase = new GetQuestionAdminSetsUseCase(questionRepository);

export const questionKanaTemplatesUseCase = new QuestionKanaTemplatesUseCase(questionRepository);
