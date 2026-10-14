import type { AdminContentKind } from '../entities/admin.entity';
import type { AdminRepository } from '../repositories/admin.repository';
export class GetAdminContentListUseCase {
	constructor(private readonly repository: AdminRepository) {}
	exec(kind: AdminContentKind) {
		return this.repository.getContentList(kind);
	}
}
