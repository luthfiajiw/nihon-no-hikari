import { AdminError, isAdminContentKind, type AdminEditorData } from '../entities/admin.entity';
import type { AdminRepository } from '../repositories/admin.repository';
export class GetAdminEditorUseCase {
	constructor(private readonly repository: AdminRepository) {}
	async exec(kind: string, id: string, parentId: string | null): Promise<AdminEditorData> {
		if (!isAdminContentKind(kind)) throw new AdminError(400, 'Jenis konten tidak valid.');
		const [catalog, levels, templates, item] = await Promise.all([
			kind === 'course' ? Promise.resolve({}) : this.repository.getCatalog(),
			kind === 'course' ? this.repository.getLevels() : Promise.resolve([]),
			kind === 'question_set' ? this.repository.getTemplates() : Promise.resolve([]),
			id === 'new'
				? Promise.resolve({ data: null, draft: null })
				: this.repository.getContent(kind, id)
		]);
		return { kind, id, parentId, record: item.data, draft: item.draft, catalog, levels, templates };
	}
}
