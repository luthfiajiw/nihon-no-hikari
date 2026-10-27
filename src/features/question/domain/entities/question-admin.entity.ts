import type { QuestionKanaTemplateMetadata } from './question-kana-template.entity';
export type QuestionAdminRecord = {
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
export type QuestionAdminContentRecord = Record<string, unknown>;
export type QuestionAdminContentDetail = {
	data: QuestionAdminContentRecord;
	draft: QuestionAdminContentRecord | null;
};
export type QuestionAdminContentAction = 'save' | 'publish' | 'remove' | 'restore';
export type QuestionAdminMutationResult = { id?: string };
export type QuestionCourseCatalog = Partial<
	Record<'courses' | 'modules' | 'lessons', QuestionAdminRecord[]>
>;
export interface QuestionCourseCatalogReader {
	getCatalog(): Promise<QuestionCourseCatalog>;
}
export type QuestionAdminEditorData = {
	kind: 'question_set';
	id: string;
	parentId: string | null;
	record: QuestionAdminContentRecord | null;
	draft: QuestionAdminContentRecord | null;
	catalog: QuestionCourseCatalog;
	templates: QuestionKanaTemplateMetadata[];
};
