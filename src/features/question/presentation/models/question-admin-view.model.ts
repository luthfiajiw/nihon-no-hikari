import type { QuestionAdminRecord } from '../../domain/entities/question-admin.entity';
import type { QuestionKanaTemplateMetadata } from '../../domain/entities/question-kana-template.entity';
import type { PaginationMeta } from '$lib/models/pagination.model';

export type QuestionAdminSetsData = {
	sets: QuestionAdminRecord[];
	meta?: PaginationMeta;
};

export type QuestionKanaTemplatesData = {
	templates: QuestionKanaTemplateMetadata[];
	meta?: PaginationMeta;
};
