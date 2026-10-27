import type { RequestEvent } from '@sveltejs/kit';
import {
	getCourseAdminCatalogUseCase,
	getCourseAdminContentListUseCase,
	getCourseAdminDetailUseCase,
	getCourseAdminEditorUseCase
} from '$dependencies/course.dependency';
import type { CourseAdminContentKind } from '../../domain/entities/course-admin.entity';
import { managementLoad } from '$lib/server/management-load';
export async function loadCourseAdminDashboard() {
	return { catalog: await managementLoad(() => getCourseAdminCatalogUseCase.exec()) };
}
export async function loadCourseAdminCourses() {
	return { courses: await managementLoad(() => getCourseAdminContentListUseCase.exec('course')) };
}
export function loadCourseAdminDetail(event: RequestEvent) {
	return managementLoad(() => getCourseAdminDetailUseCase.exec(event.params.id!));
}
export function loadCourseAdminEditor(event: RequestEvent, kind: CourseAdminContentKind) {
	return managementLoad(() =>
		getCourseAdminEditorUseCase.exec(kind, event.params.id!, event.url.searchParams.get('parent'))
	);
}
