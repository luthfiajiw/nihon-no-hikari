import type { QuestionAdminRepository } from '../repositories/question-admin.repository';
export class GetQuestionAdminSetsUseCase {
	constructor(private readonly repository: QuestionAdminRepository) {}
	exec() {
		return this.repository.getAdminContentList();
	}
}
