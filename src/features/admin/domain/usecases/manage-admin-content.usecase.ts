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
		payload?: unknown
	): Promise<AdminMutationResult> {
		if (!isAdminContentKind(kind)) throw new AdminError(400, 'Jenis konten tidak valid.');
		if (action === 'save') {
			if (typeof payload !== 'string') throw new AdminError(400, 'Form tidak lengkap.');
			let parsed: unknown;
			try {
				parsed = JSON.parse(payload);
			} catch {
				throw new AdminError(400, 'Data form tidak valid.');
			}
			if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
				throw new AdminError(400, 'Data form tidak valid.');
			return this.repository.saveContent(
				kind,
				id === 'new' ? null : id,
				parsed as AdminContentRecord
			);
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
