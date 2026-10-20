import type { WritingGuide } from '$features/question/domain/entities/question.entity';

export type KanaScript = 'hiragana' | 'katakana';
export type KanaStrokeData = Pick<WritingGuide, 'view_box' | 'strokes'>;
export type KanaTemplateMetadata = {
	id: string;
	script: KanaScript;
	character: string;
	romaji: string;
	source_version: string;
	stroke_count: number;
};
export type KanaTemplateDetail = KanaTemplateMetadata & { stroke_data: KanaStrokeData };
export type KanaTemplatePreview = Omit<KanaTemplateDetail, 'id'>;
export type KanaTemplateInput = {
	script: KanaScript;
	character: string;
	romaji: string;
	source_version: string;
	svg_content?: string;
};
export const MAX_KANA_SVG_BYTES = 256 * 1024;
