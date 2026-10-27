// Pick the fields for the resource rather than cloning Svelte's reactive proxy.
export function courseAdminContentPayload(kind: string, item: Record<string, unknown>): string {
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
			'module_prerequisites',
			'estimated_minutes'
		],
		lesson: [
			'module_id',
			'slug',
			'title',
			'content',
			'order_index',
			'is_entry',
			'lesson_prerequisites'
		]
	};
	const payload = Object.fromEntries((fields[kind] ?? []).map((field) => [field, item[field]]));
	if (kind === 'module' || kind === 'lesson') {
		const field = `${kind}_prerequisites`;
		const selected = item[field];
		payload[field] = item.is_entry
			? []
			: Array.isArray(selected)
				? selected.slice(0, 1)
				: undefined;
	}
	return JSON.stringify(payload);
}
