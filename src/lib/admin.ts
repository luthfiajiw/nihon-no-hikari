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

export function matchesContent(item: AdminRecord, query: string, status: string): boolean {
	const actual = item.archived_at ? 'archived' : item.is_published ? 'published' : 'draft';
	return (
		(status === 'all' || status === actual) &&
		`${item.title} ${item.slug ?? ''}`
			.toLocaleLowerCase()
			.includes(query.trim().toLocaleLowerCase())
	);
}

// Pick the fields for the resource rather than cloning Svelte's reactive proxy.
export function contentPayload(kind: string, item: Record<string, unknown>): string {
	const fields: Record<string, string[]> = {
		course: ['level_id', 'slug', 'title', 'description', 'thumbnail_url', 'order_index'],
		module: [
			'course_id',
			'slug',
			'title',
			'description',
			'order_index',
			'is_mandatory',
			'is_entry',
			'estimated_minutes'
		],
		lesson: ['module_id', 'slug', 'title', 'content', 'order_index']
	};
	if (kind === 'question_set') {
		return JSON.stringify({
			...item,
			module_id: item.kind === 'practice' ? null : item.module_id,
			lesson_id: item.kind === 'final_exam' ? null : item.lesson_id
		});
	}
	return JSON.stringify(
		Object.fromEntries((fields[kind] ?? []).map((field) => [field, item[field]]))
	);
}
