import type { QuestionKanaTemplateInput } from '$features/question/domain/entities/question-kana-template.entity';
import type { QuestionAdminRepository } from '../repositories/question-admin.repository';

export class QuestionKanaTemplatesUseCase {
	constructor(private readonly repository: QuestionAdminRepository) {}
	list() {
		return this.repository.getAdminTemplates();
	}
	detail(id: string) {
		return this.repository.getAdminTemplate(id);
	}
	preview(input: QuestionKanaTemplateInput) {
		return this.repository.previewAdminTemplate(input);
	}
	save(id: string | null, input: QuestionKanaTemplateInput) {
		return this.repository.saveAdminTemplate(id, input);
	}
}
