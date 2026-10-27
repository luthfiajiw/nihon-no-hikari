import { resolve } from '$app/paths';
import type { CourseAdminContentKind } from '../domain/entities/course-admin.entity';
export function courseAdminEditorUrl(kind: CourseAdminContentKind, id: string) {
	if (kind === 'course') return resolve('/(protected)/admin/content/course/[id]', { id });
	if (kind === 'module') return resolve('/(protected)/admin/content/module/[id]', { id });
	return resolve('/(protected)/admin/content/lesson/[id]', { id });
}
