import type { CourseAdminContentKind } from '../domain/entities/course-admin.entity';

export const courseAdminContentResources = {
	course: 'courses',
	module: 'modules',
	lesson: 'lessons'
} as const satisfies Record<CourseAdminContentKind, string>;

export function courseAdminContentKind(resource: string): CourseAdminContentKind | undefined {
	return (Object.keys(courseAdminContentResources) as CourseAdminContentKind[]).find(
		(kind) => courseAdminContentResources[kind] === resource
	);
}
