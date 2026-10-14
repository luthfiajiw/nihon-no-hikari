import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { createAdminDependencies } from '$dependencies/admin.dependency';
import { AdminError, isAdminContentKind } from '../../domain/entities/admin.entity';

async function loadAdmin<T>(operation: () => Promise<T>): Promise<T> {
	try {
		return await operation();
	} catch (cause) {
		if (!(cause instanceof AdminError)) throw cause;
		if (cause.status === 401) redirect(303, resolve('/signin'));
		if (cause.status === 403) redirect(303, resolve('/'));
		error(cause.status, cause.message);
	}
}
export function loadAdminAccess(event: RequestEvent) {
	return loadAdmin(() => createAdminDependencies(event).checkAdminAccessUseCase.exec());
}
export async function loadAdminDashboard(event: RequestEvent) {
	return {
		catalog: await loadAdmin(() => createAdminDependencies(event).getAdminCatalogUseCase.exec())
	};
}
export async function loadAdminCourses(event: RequestEvent) {
	return {
		courses: await loadAdmin(() =>
			createAdminDependencies(event).getAdminContentListUseCase.exec('course')
		)
	};
}
export async function loadAdminQuestionSets(event: RequestEvent) {
	return {
		sets: await loadAdmin(() =>
			createAdminDependencies(event).getAdminContentListUseCase.exec('question_set')
		)
	};
}
export function loadAdminCourseDetail(event: RequestEvent) {
	return loadAdmin(() =>
		createAdminDependencies(event).getAdminCourseDetailUseCase.exec(event.params.id!)
	);
}
export function loadAdminEditor(event: RequestEvent) {
	if (!isAdminContentKind(event.params.kind ?? '')) redirect(303, resolve('/admin'));
	return loadAdmin(() =>
		createAdminDependencies(event).getAdminEditorUseCase.exec(
			event.params.kind!,
			event.params.id!,
			event.url.searchParams.get('parent')
		)
	);
}
export async function loadAdminUsers(event: RequestEvent) {
	return {
		users: await loadAdmin(() => createAdminDependencies(event).getAdminUsersUseCase.exec())
	};
}
