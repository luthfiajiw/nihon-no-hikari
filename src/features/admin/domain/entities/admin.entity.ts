export type AdminContentKind = 'course' | 'module' | 'lesson' | 'question_set';
export type AdminContentAction = 'save' | 'publish' | 'remove' | 'restore';
export type AdminReorderKind = 'module' | 'lesson';
export type AdminReorderInput = { parent_id: string; ordered_ids: string[] };
export type AdminRecord = {
	id: string;
	title: string;
	slug?: string;
	description?: string | null;
	thumbnail_url?: string | null;
	is_published?: boolean;
	archived_at?: string | null;
	order_index?: number;
	course_id?: string;
	module_id?: string | null;
	lesson_id?: string | null;
	kind?: string;
	skill?: string | null;
	version?: number;
	module_count?: number;
	lesson_count?: number;
};
export type AdminCatalog = Record<
	'courses' | 'modules' | 'lessons' | 'question_sets',
	AdminRecord[]
>;
export type AdminContentRecord = Record<string, unknown>;
export type AdminContentDetail = { data: AdminContentRecord; draft: AdminContentRecord | null };
export type AdminUserRole = 'User' | 'Admin';
export type ManagedUser = { id: string; email: string; display_name: string; role: AdminUserRole };
export type AdminEditorData = {
	kind: AdminContentKind;
	id: string;
	parentId: string | null;
	record: AdminContentRecord | null;
	draft: AdminContentRecord | null;
	catalog: Partial<AdminCatalog>;
	levels: AdminContentRecord[];
	templates: AdminContentRecord[];
};
export type AdminMutationResult = { id?: string };
export type AdminLessonContent = { content: string; tips: string; [key: string]: unknown };

export function isAdminContentKind(kind: string): kind is AdminContentKind {
	return ['course', 'module', 'lesson', 'question_set'].includes(kind);
}

export class AdminError extends Error {
	constructor(
		public readonly status: number,
		message: string
	) {
		super(message);
		this.name = 'AdminError';
	}
}
