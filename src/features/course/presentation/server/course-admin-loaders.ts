import type { RequestEvent } from '@sveltejs/kit';
import {
	getCourseAdminCatalogUseCase,
	getCourseAdminContentListUseCase,
	getCourseAdminDetailUseCase,
	getCourseAdminEditorUseCase,
	getCourseAdminLevelsUseCase,
	getCourseAdminLevelEditorUseCase
} from '$dependencies/course.dependency';
import type { CourseAdminContentKind } from '../../domain/entities/course-admin.entity';
import { managementLoad } from '$lib/server/management-load';
import { parsePaginationParams } from '$lib/models/pagination.model';
export async function loadCourseAdminDashboard() {
	return { catalog: await managementLoad(() => getCourseAdminCatalogUseCase.exec()) };
}
export async function loadCourseAdminCourses() {
	return { courses: await managementLoad(() => getCourseAdminContentListUseCase.exec('course')) };
}
export async function loadCourseAdminLevels(event: RequestEvent) {
	const params = parsePaginationParams(event.url);
	const result = await managementLoad(() => getCourseAdminLevelsUseCase.exec(params));
	return { levels: result.items, meta: result.meta };
}
export function loadCourseAdminDetail(event: RequestEvent) {
	return managementLoad(() => getCourseAdminDetailUseCase.exec(event.params.id!));
}
export function loadCourseAdminEditor(event: RequestEvent, kind: CourseAdminContentKind) {
	return managementLoad(() =>
		getCourseAdminEditorUseCase.exec(kind, event.params.id!, event.url.searchParams.get('parent'))
	);
}
export async function loadCourseAdminLevelEditor(event: RequestEvent) {
	const level = await managementLoad(() =>
		getCourseAdminLevelEditorUseCase.exec(event.params.id!)
	);
	return { level, id: event.params.id! };
}
