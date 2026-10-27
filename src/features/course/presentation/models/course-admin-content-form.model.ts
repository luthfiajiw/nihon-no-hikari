import type { CourseAdminEditorData } from '../../domain/entities/course-admin.entity';
export type CourseAdminContentFormItem = {
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
	module_prerequisites: string[];
	lesson_prerequisites: string[];
	estimated_minutes: number | null;
	content: { content: string; tips: string; [key: string]: unknown };
};

export function initialCourseAdminContent(data: CourseAdminEditorData): CourseAdminContentFormItem {
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
		module_prerequisites: (
			(source.module_prerequisites ?? data.record?.module_prerequisites ?? []) as string[]
		).slice(0, 1),
		lesson_prerequisites: (
			(source.lesson_prerequisites ?? data.record?.lesson_prerequisites ?? []) as string[]
		).slice(0, 1),
		estimated_minutes: source.estimated_minutes == null ? null : Number(source.estimated_minutes),
		content: {
			...rawContent,
			content: String(rawContent.content ?? ''),
			tips: String(rawContent.tips ?? '')
		}
	};
}
