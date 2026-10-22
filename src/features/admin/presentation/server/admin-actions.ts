import { fail, json, redirect, type RequestEvent } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import {
	reorderAdminContentUseCase,
	manageAdminContentUseCase,
	changeAdminUserRoleUseCase,
	previewAdminLessonUseCase
} from '$dependencies/admin.dependency';
import {
	AdminError,
	type AdminContentAction,
	type AdminContentRecord,
	type AdminLessonContent,
	type AdminReorderInput,
	type AdminUserRole
} from '../../domain/entities/admin.entity';

function readFormPayload(value: FormDataEntryValue | null): unknown {
	if (typeof value !== 'string') throw new AdminError(400, 'Form tidak lengkap.');
	try {
		return JSON.parse(value);
	} catch {
		throw new AdminError(400, 'Data form tidak valid.');
	}
}

function actionFailure(cause: unknown) {
	if (!(cause instanceof AdminError)) throw cause;
	if (cause.status === 401) redirect(303, resolve('/signin'));
	return fail(cause.status, { message: cause.message });
}
export async function reorderAdminContent(event: RequestEvent) {
	try {
		const form = await event.request.formData();
		const kind = form.get('kind');
		if (kind !== 'module' && kind !== 'lesson')
			throw new AdminError(400, 'Jenis konten urutan tidak valid.');
		const input = readFormPayload(form.get('payload')) as AdminReorderInput;
		await reorderAdminContentUseCase.exec(kind, input);
		return { message: 'Urutan berhasil disimpan.' };
	} catch (cause) {
		return actionFailure(cause);
	}
}
export async function manageAdminContent(event: RequestEvent, action: AdminContentAction) {
	const kind = event.params.kind!;
	const id = event.params.id!;
	let result;
	try {
		const payload =
			action === 'save'
				? (readFormPayload((await event.request.formData()).get('payload')) as AdminContentRecord)
				: undefined;
		result = await manageAdminContentUseCase.exec(action, kind, id, payload);
	} catch (cause) {
		return actionFailure(cause);
	}
	if (action === 'remove')
		redirect(303, resolve(kind === 'question_set' ? '/admin/question-sets' : '/admin/courses'));
	if (result.id && (id === 'new' || result.id !== id))
		redirect(303, resolve('/(protected)/admin/content/[kind]/[id]', { kind, id: result.id }));
	const messages = {
		save: 'Draft berhasil disimpan.',
		publish: 'Konten berhasil diterbitkan.',
		restore: 'Arsip dipulihkan sebagai draft.',
		remove: ''
	};
	return { message: messages[action] };
}
export async function changeAdminUserRole(event: RequestEvent) {
	try {
		const form = await event.request.formData();
		await changeAdminUserRoleUseCase.exec(
			event.locals.user,
			String(form.get('userId') ?? ''),
			form.get('role') as AdminUserRole
		);
		return { message: 'Role pengguna berhasil diperbarui.' };
	} catch (cause) {
		return actionFailure(cause);
	}
}
export async function previewAdminLesson(event: RequestEvent) {
	try {
		let payload: unknown;
		try {
			payload = await event.request.json();
		} catch {
			throw new AdminError(400, 'Konten lesson tidak valid.');
		}
		const input = (payload as { content?: AdminLessonContent } | null)?.content;
		const content = await previewAdminLessonUseCase.exec(input as AdminLessonContent);
		return json({ data: content });
	} catch (cause) {
		if (!(cause instanceof AdminError)) throw cause;
		if (cause.status === 401) redirect(303, resolve('/signin'));
		if (cause.status === 403) redirect(303, resolve('/'));
		return json({ error: cause.message }, { status: cause.status });
	}
}
