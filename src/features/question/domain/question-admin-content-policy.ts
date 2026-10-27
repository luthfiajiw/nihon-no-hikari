export function questionAdminContentPayload(item: Record<string, unknown>): string {
	return JSON.stringify({
		...item,
		module_id: item.kind === 'practice' ? null : item.module_id,
		lesson_id: item.kind === 'final_exam' ? null : item.lesson_id
	});
}
