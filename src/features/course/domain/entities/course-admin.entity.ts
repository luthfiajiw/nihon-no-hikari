export type CourseAdminContentKind = 'course' | 'module' | 'lesson';
export type CourseAdminContentAction = 'save' | 'publish' | 'remove' | 'restore';
export type CourseAdminReorderKind = 'module' | 'lesson';
export type CourseAdminReorderInput = { parent_id: string; ordered_ids: string[] };
export type CourseAdminRecord = {
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
export type CourseAdminCatalog = Record<
	'courses' | 'modules' | 'lessons' | 'question_sets',
	CourseAdminRecord[]
>;
export type CourseAdminContentRecord = Record<string, unknown>;
export type CourseAdminContentDetail = {
	data: CourseAdminContentRecord;
	draft: CourseAdminContentRecord | null;
};
export type CourseAdminEditorData = {
	kind: CourseAdminContentKind;
	id: string;
	parentId: string | null;
	record: CourseAdminContentRecord | null;
	draft: CourseAdminContentRecord | null;
	catalog: Partial<CourseAdminCatalog>;
	levels: CourseAdminContentRecord[];
};
export type CourseAdminMutationResult = { id?: string };
export type CourseAdminLessonContent = { content: string; tips: string; [key: string]: unknown };
export function isCourseAdminContentKind(kind: string): kind is CourseAdminContentKind {
	return ['course', 'module', 'lesson'].includes(kind);
}
