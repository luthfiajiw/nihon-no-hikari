import type {
	AdminReorderKind,
	AdminReorderInput,
	AdminCatalog,
	AdminContentKind,
	AdminContentDetail,
	AdminRecord,
	AdminContentRecord,
	AdminMutationResult,
	AdminUserRole,
	ManagedUser,
	AdminLessonContent
} from '../entities/admin.entity';

import type {
	KanaTemplateMetadata,
	KanaTemplateDetail,
	KanaTemplateInput,
	KanaTemplatePreview
} from '../entities/kana-template.entity';

export interface AdminRepository {
	reorderContent(kind: AdminReorderKind, input: AdminReorderInput): Promise<void>;
	checkAccess(): Promise<void>;
	getCatalog(courseId?: string): Promise<AdminCatalog>;
	getContentList(kind: AdminContentKind): Promise<AdminRecord[]>;
	getContent(kind: AdminContentKind, id: string): Promise<AdminContentDetail>;
	getLevels(): Promise<AdminContentRecord[]>;
	getTemplates(): Promise<KanaTemplateMetadata[]>;
	getTemplate(id: string): Promise<KanaTemplateDetail>;
	previewTemplate(input: KanaTemplateInput): Promise<KanaTemplatePreview>;
	saveTemplate(id: string | null, input: KanaTemplateInput): Promise<KanaTemplateDetail>;
	getUsers(): Promise<ManagedUser[]>;
	saveContent(
		kind: AdminContentKind,
		id: string | null,
		payload: AdminContentRecord
	): Promise<AdminMutationResult>;
	publishContent(kind: AdminContentKind, id: string): Promise<AdminMutationResult>;
	removeContent(kind: AdminContentKind, id: string): Promise<void>;
	restoreContent(kind: AdminContentKind, id: string): Promise<void>;
	changeRole(userId: string, role: AdminUserRole): Promise<void>;
	previewLesson(content: AdminLessonContent): Promise<AdminLessonContent>;
}
