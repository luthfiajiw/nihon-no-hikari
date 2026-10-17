import { AdminError, type AdminReorderInput } from '../entities/admin.entity';
import type { AdminRepository } from '../repositories/admin.repository';

const uuid =
	/^(?!00000000-0000-0000-0000-000000000000$)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class ReorderAdminContentUseCase {
	constructor(private readonly repository: AdminRepository) {}
	async exec(kind: unknown, payload: unknown): Promise<void> {
		if ((kind !== 'module' && kind !== 'lesson') || typeof payload !== 'string')
			throw new AdminError(400, 'Data urutan tidak valid.');
		let input: AdminReorderInput;
		try {
			input = JSON.parse(payload);
		} catch {
			throw new AdminError(400, 'Data urutan tidak valid.');
		}
		if (
			!input ||
			typeof input.parent_id !== 'string' ||
			!uuid.test(input.parent_id) ||
			!Array.isArray(input.ordered_ids) ||
			input.ordered_ids.length > 32768 ||
			input.ordered_ids.some((id) => typeof id !== 'string' || !uuid.test(id)) ||
			new Set(input.ordered_ids.map((id) => id.toLowerCase())).size !== input.ordered_ids.length
		)
			throw new AdminError(400, 'Data urutan tidak valid.');
		await this.repository.reorderContent(kind, input);
	}
}
