import type { KanaTemplateInput } from '../entities/kana-template.entity';
import type { AdminRepository } from '../repositories/admin.repository';

export class KanaTemplatesUseCase {
	constructor(private readonly repository: AdminRepository) {}
	list() {
		return this.repository.getTemplates();
	}
	detail(id: string) {
		return this.repository.getTemplate(id);
	}
	preview(input: KanaTemplateInput) {
		return this.repository.previewTemplate(input);
	}
	save(id: string | null, input: KanaTemplateInput) {
		return this.repository.saveTemplate(id, input);
	}
}
