import { HttpError } from '$lib/http/http-error';
import type { QuestionAdminRepository } from '../repositories/question-admin.repository';
import type {
	QuestionAdminContentAction,
	QuestionAdminContentRecord,
	QuestionAdminMutationResult
} from '../entities/question-admin.entity';
export class ManageQuestionAdminContentUseCase {
	constructor(private readonly repository: QuestionAdminRepository) {}
	async exec(
		action: QuestionAdminContentAction,
		id: string,
		payload?: QuestionAdminContentRecord
	): Promise<QuestionAdminMutationResult> {
		if (action === 'save') {
			if (payload === undefined) throw new HttpError(400, 'Form tidak lengkap.');
			return this.repository.saveAdminContent(id === 'new' ? null : id, payload);
		}
		if (id === 'new')
			throw new HttpError(
				400,
				action === 'publish' ? 'Simpan draft terlebih dahulu.' : 'Konten tidak valid.'
			);
		if (action === 'publish') return this.repository.publishAdminContent(id);
		if (action === 'remove') await this.repository.removeAdminContent(id);
		else await this.repository.restoreAdminContent(id);
		return {};
	}
}
