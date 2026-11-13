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
export async function loadCourseAdminCourses(event: RequestEvent) {
	const params = parsePaginationParams(event.url);
	const status = event.url.searchParams.get('status') || undefined;
	const level = event.url.searchParams.get('level') || undefined;
	const result = await managementLoad(() =>
		getCourseAdminContentListUseCase.exec('course', { ...params, status, level })
	);
	return { courses: result.items, meta: result.meta };
}
export async function loadCourseAdminLevels(event: RequestEvent) {
	const params = parsePaginationParams(event.url);
	const price_type = event.url.searchParams.get('price_type') || undefined;
	const result = await managementLoad(() =>
		getCourseAdminLevelsUseCase.exec({ ...params, price_type })
	);
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
