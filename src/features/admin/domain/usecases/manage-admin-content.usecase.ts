import {
	AdminError,
	isAdminContentKind,
	type AdminContentAction,
	type AdminContentRecord,
	type AdminMutationResult
} from '../entities/admin.entity';
import type { AdminRepository } from '../repositories/admin.repository';
export class ManageAdminContentUseCase {
	constructor(private readonly repository: AdminRepository) {}
	async exec(
		action: AdminContentAction,
		kind: string,
		id: string,
		payload?: AdminContentRecord
	): Promise<AdminMutationResult> {
		if (!isAdminContentKind(kind)) throw new AdminError(400, 'Jenis konten tidak valid.');
		if (action === 'save') {
			if (payload === undefined) throw new AdminError(400, 'Form tidak lengkap.');
			return this.repository.saveContent(kind, id === 'new' ? null : id, payload);
		}
		if (id === 'new')
			throw new AdminError(
				400,
				action === 'publish' ? 'Simpan draft terlebih dahulu.' : 'Konten tidak valid.'
			);
		if (action === 'publish') return this.repository.publishContent(kind, id);
		if (action === 'remove') await this.repository.removeContent(kind, id);
		else await this.repository.restoreContent(kind, id);
		return {};
	}
}
