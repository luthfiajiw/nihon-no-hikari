import type { QuestionAdminRepository } from '../repositories/question-admin.repository';
import type {
	QuestionAdminEditorData,
	QuestionCourseCatalogReader
} from '../entities/question-admin.entity';
export class GetQuestionAdminEditorUseCase {
	constructor(
		private readonly repository: QuestionAdminRepository,
		private readonly courseCatalog: QuestionCourseCatalogReader
	) {}
	async exec(id: string, parentId: string | null): Promise<QuestionAdminEditorData> {
		const [catalog, templates, item] = await Promise.all([
			this.courseCatalog.getCatalog(),
			this.repository.getAdminTemplates(),
			id === 'new'
				? Promise.resolve({ data: null, draft: null })
				: this.repository.getAdminContent(id)
		]);
		return {
			kind: 'question_set',
			id,
			parentId,
			record: item.data,
			draft: item.draft,
			catalog,
			templates
		};
	}
}
