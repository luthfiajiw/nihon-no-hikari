import { AdminError, type AdminLessonContent } from '../entities/admin.entity';
import type { AdminRepository } from '../repositories/admin.repository';
export class PreviewAdminLessonUseCase {
	constructor(private readonly repository: AdminRepository) {}
	async exec(payload: unknown): Promise<AdminLessonContent> {
		const content =
			payload && typeof payload === 'object' && 'content' in payload ? payload.content : null;
		if (
			!content ||
			typeof content !== 'object' ||
			!('content' in content) ||
			typeof content.content !== 'string'
		)
			throw new AdminError(400, 'Konten lesson tidak valid.');
		return this.repository.previewLesson(content as AdminLessonContent);
	}
}
