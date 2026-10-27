import type { QuestionAdminEditorData } from '../../domain/entities/question-admin.entity';
export type QuestionAdminFormOption = {
	label: string;
	media_url: string | null;
	is_correct: boolean;
};
export type QuestionAdminFormQuestion = {
	question_type: string;
	prompt_text: string;
	stimulus_text: string;
	stimulus_media_url: string | null;
	explanation: string;
	points: number;
	stroke_template_id: string | null;
	show_writing_guide: boolean;
	options: QuestionAdminFormOption[];
};
export type QuestionAdminContentFormItem = {
	id?: string;
	title: string;
	order_index: number;
	module_id: string;
	lesson_id: string | null;
	kind: string;
	skill: string;
	passing_score: number;
	total_questions: number | null;
	time_limit_seconds: number | null;
	max_attempts: number | null;
	cooldown_minutes: number;
	shuffle_questions: boolean;
	questions: QuestionAdminFormQuestion[];
};
export function initialQuestionAdminContent(
	data: QuestionAdminEditorData
): QuestionAdminContentFormItem {
	const source = (data.draft ?? data.record ?? {}) as Record<string, unknown>;
	const modules = data.catalog.modules ?? [];
	const lessons = data.catalog.lessons ?? [];
	return {
		id: source.id as string | undefined,
		title: String(source.title ?? ''),
		order_index: Number(source.order_index ?? 0),
		module_id: String(source.module_id ?? modules[0]?.id ?? ''),
		kind: String(source.kind ?? 'practice'),
		lesson_id:
			(source.lesson_id as string | null) ?? (data.parentId || (lessons[0]?.id as string) || null),
		skill: String(source.skill ?? 'reading'),
		passing_score: Number(source.passing_score ?? 80),
		total_questions: source.total_questions == null ? null : Number(source.total_questions),
		time_limit_seconds:
			source.time_limit_seconds == null ? null : Number(source.time_limit_seconds),
		max_attempts: source.max_attempts == null ? null : Number(source.max_attempts),
		cooldown_minutes: Number(source.cooldown_minutes ?? 0),
		shuffle_questions: Boolean(source.shuffle_questions ?? true),
		questions: Array.isArray(source.questions)
			? (source.questions as QuestionAdminFormQuestion[])
			: []
	};
}
