import type { WritingGuide } from '$features/question/domain/entities/question.entity';

export type QuestionKanaScript = 'hiragana' | 'katakana';
export type QuestionKanaStrokeData = Pick<WritingGuide, 'view_box' | 'strokes'>;
export type QuestionKanaTemplateMetadata = {
	id: string;
	script: QuestionKanaScript;
	character: string;
	romaji: string;
	source_version: string;
	stroke_count: number;
};
export type QuestionKanaTemplateDetail = QuestionKanaTemplateMetadata & {
	stroke_data: QuestionKanaStrokeData;
};
export type QuestionKanaTemplatePreview = Omit<QuestionKanaTemplateDetail, 'id'>;
export type QuestionKanaTemplateInput = {
	script: QuestionKanaScript;
	character: string;
	romaji: string;
	source_version: string;
	svg_content?: string;
};
export const QUESTION_MAX_KANA_SVG_BYTES = 256 * 1024;
