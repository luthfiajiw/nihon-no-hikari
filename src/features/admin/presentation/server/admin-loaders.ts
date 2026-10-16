import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import {
	checkAdminAccessUseCase,
	getAdminCatalogUseCase,
	getAdminContentListUseCase,
	getAdminCourseDetailUseCase,
	getAdminEditorUseCase,
	getAdminUsersUseCase
} from '$dependencies/admin.dependency';
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
export function loadAdminAccess() {
	return loadAdmin(() => checkAdminAccessUseCase.exec());
}
export async function loadAdminDashboard() {
	return {
		catalog: await loadAdmin(() => getAdminCatalogUseCase.exec())
	};
}
export async function loadAdminCourses() {
	return {
		courses: await loadAdmin(() => getAdminContentListUseCase.exec('course'))
	};
}
export async function loadAdminQuestionSets() {
	return {
		sets: await loadAdmin(() => getAdminContentListUseCase.exec('question_set'))
	};
}
export function loadAdminCourseDetail(event: RequestEvent) {
	return loadAdmin(() => getAdminCourseDetailUseCase.exec(event.params.id!));
}
export function loadAdminEditor(event: RequestEvent) {
	if (!isAdminContentKind(event.params.kind ?? '')) redirect(303, resolve('/admin'));
	return loadAdmin(() =>
		getAdminEditorUseCase.exec(
			event.params.kind!,
			event.params.id!,
			event.url.searchParams.get('parent')
		)
	);
}
export async function loadAdminUsers() {
	return {
		users: await loadAdmin(() => getAdminUsersUseCase.exec())
	};
}
