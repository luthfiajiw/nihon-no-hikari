import type { AdminReorderInput, AdminReorderKind } from '../entities/admin.entity';
import type { AdminRepository } from '../repositories/admin.repository';

export class ReorderAdminContentUseCase {
	constructor(private readonly repository: AdminRepository) {}
	exec(kind: AdminReorderKind, input: AdminReorderInput): Promise<void> {
		return this.repository.reorderContent(kind, input);
	}
}
