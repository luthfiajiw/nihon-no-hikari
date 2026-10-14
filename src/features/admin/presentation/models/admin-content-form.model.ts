import type { AdminEditorData } from '../../domain/entities/admin.entity';

export type Option = { label: string; media_url: string | null; is_correct: boolean };
export type Question = {
	question_type: string;
	prompt_text: string;
	stimulus_text: string;
	stimulus_media_url: string | null;
	explanation: string;
	points: number;
	stroke_template_id: string | null;
	show_writing_guide: boolean;
	options: Option[];
};
export type AdminContentFormItem = {
	id?: string;
	level_id: string;
	course_id: string;
	module_id: string;
	slug: string;
	title: string;
	description: string;
	thumbnail_url: string;
	order_index: number;
	is_mandatory: boolean;
	is_entry: boolean;
	estimated_minutes: number | null;
	content: { content: string; tips: string; [key: string]: unknown };
	kind: string;
	lesson_id: string | null;
	skill: string;
	passing_score: number;
	total_questions: number | null;
	time_limit_seconds: number | null;
	max_attempts: number | null;
	cooldown_minutes: number;
	shuffle_questions: boolean;
	questions: Question[];
};

export function initialAdminContent(data: AdminEditorData): AdminContentFormItem {
	const courses = data.catalog.courses ?? [];
	const modules = data.catalog.modules ?? [];
	const lessons = data.catalog.lessons ?? [];
	const levels = data.levels;
	const source = (data.draft ?? data.record ?? {}) as Record<string, unknown>;
	const rawContent =
		source.content && typeof source.content === 'object' && !Array.isArray(source.content)
			? (source.content as Record<string, unknown>)
			: {};
	return {
		id: source.id as string | undefined,
		level_id: String(source.level_id ?? levels[0]?.id ?? ''),
		course_id: String(
			source.course_id ?? (data.kind === 'module' ? data.parentId : null) ?? courses[0]?.id ?? ''
		),
		module_id: String(
			source.module_id ?? (data.kind === 'lesson' ? data.parentId : null) ?? modules[0]?.id ?? ''
		),
		slug: String(source.slug ?? ''),
		title: String(source.title ?? ''),
		description: String(source.description ?? ''),
		thumbnail_url: String(source.thumbnail_url ?? ''),
		order_index: Number(
			source.order_index ??
				(data.kind === 'module'
					? modules.filter((module) => module.course_id === (data.parentId ?? courses[0]?.id))
							.length
					: data.kind === 'lesson'
						? lessons.filter((lesson) => lesson.module_id === (data.parentId ?? modules[0]?.id))
								.length
						: 0)
		),
		is_mandatory: Boolean(source.is_mandatory ?? true),
		is_entry: Boolean(source.is_entry ?? false),
		estimated_minutes: source.estimated_minutes == null ? null : Number(source.estimated_minutes),
		content: {
			...rawContent,
			content: String(rawContent.content ?? ''),
			tips: String(rawContent.tips ?? '')
		},
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
		questions: Array.isArray(source.questions) ? (source.questions as Question[]) : []
	};
}
