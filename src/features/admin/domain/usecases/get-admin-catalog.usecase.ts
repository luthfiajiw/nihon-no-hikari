import type { AdminRepository } from '../repositories/admin.repository';
export class GetAdminCatalogUseCase {
	constructor(private readonly repository: AdminRepository) {}
	exec() {
		return this.repository.getCatalog();
	}
}
