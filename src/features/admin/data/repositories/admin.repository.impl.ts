import type {
	AdminReorderKind,
	AdminReorderInput,
	AdminCatalog,
	AdminContentKind,
	AdminContentDetail,
	AdminRecord,
	AdminContentRecord,
	AdminMutationResult,
	ManagedUser,
	AdminUserRole,
	AdminLessonContent
} from '../../domain/entities/admin.entity';
import type { AdminRepository } from '../../domain/repositories/admin.repository';
import { AdminSource } from '../sources/admin.source';
export class AdminRepositoryImpl implements AdminRepository {
	constructor(private readonly source: AdminSource) {}
	reorderContent(kind: AdminReorderKind, input: AdminReorderInput): Promise<void> {
		return this.source.reorderContent(kind, input);
	}
	checkAccess(): Promise<void> {
		return this.source.checkAccess();
	}
	getCatalog(courseId?: string): Promise<AdminCatalog> {
		return this.source.getCatalog(courseId);
	}
	getContentList(kind: AdminContentKind): Promise<AdminRecord[]> {
		return this.source.getContentList(kind);
	}
	getContent(kind: AdminContentKind, id: string): Promise<AdminContentDetail> {
		return this.source.getContent(kind, id);
	}
	getLevels(): Promise<AdminContentRecord[]> {
		return this.source.getLevels();
	}
	getTemplates(): Promise<AdminContentRecord[]> {
		return this.source.getTemplates();
	}
	getUsers(): Promise<ManagedUser[]> {
		return this.source.getUsers();
	}
	saveContent(
		kind: AdminContentKind,
		id: string | null,
		payload: AdminContentRecord
	): Promise<AdminMutationResult> {
		return this.source.saveContent(kind, id, payload);
	}
	publishContent(kind: AdminContentKind, id: string): Promise<AdminMutationResult> {
		return this.source.publishContent(kind, id);
	}
	removeContent(kind: AdminContentKind, id: string): Promise<void> {
		return this.source.removeContent(kind, id);
	}
	restoreContent(kind: AdminContentKind, id: string): Promise<void> {
		return this.source.restoreContent(kind, id);
	}
	changeRole(userId: string, role: AdminUserRole): Promise<void> {
		return this.source.changeRole(userId, role);
	}
	previewLesson(content: AdminLessonContent): Promise<AdminLessonContent> {
		return this.source.previewLesson(content);
	}
}
