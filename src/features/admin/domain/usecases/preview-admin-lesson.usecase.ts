import type { AdminLessonContent } from '../entities/admin.entity';
import type { AdminRepository } from '../repositories/admin.repository';
export class PreviewAdminLessonUseCase {
	constructor(private readonly repository: AdminRepository) {}
	exec(content: AdminLessonContent): Promise<AdminLessonContent> {
		return this.repository.previewLesson(content);
	}
}
