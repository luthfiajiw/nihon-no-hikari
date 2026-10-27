import { courseAdminEditorUrl } from '../course-admin-navigation';
import { json, redirect, type RequestEvent } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { HttpError } from '$lib/http/http-error';
import { readManagementFormPayload, managementActionFailure } from '$lib/server/management-action';
import {
	reorderCourseAdminContentUseCase,
	manageCourseAdminContentUseCase,
	previewCourseAdminLessonUseCase
} from '$dependencies/course.dependency';
import type {
	CourseAdminContentKind,
	CourseAdminContentAction,
	CourseAdminContentRecord,
	CourseAdminLessonContent,
	CourseAdminReorderInput
} from '../../domain/entities/course-admin.entity';
export async function reorderCourseAdminContent(event: RequestEvent) {
	try {
		const form = await event.request.formData();
		const kind = form.get('kind');
		if (kind !== 'module' && kind !== 'lesson')
			throw new HttpError(400, 'Jenis konten urutan tidak valid.');
		const input = readManagementFormPayload(form.get('payload')) as CourseAdminReorderInput;
		await reorderCourseAdminContentUseCase.exec(kind, input);
		return { message: 'Urutan berhasil disimpan.' };
	} catch (cause) {
		return managementActionFailure(cause);
	}
}
export async function manageCourseAdminContent(
	event: RequestEvent,
	kind: CourseAdminContentKind,
	action: CourseAdminContentAction
) {
	const id = event.params.id!;
	let result;
	try {
		const payload =
			action === 'save'
				? (readManagementFormPayload(
						(await event.request.formData()).get('payload')
					) as CourseAdminContentRecord)
				: undefined;
		result = await manageCourseAdminContentUseCase.exec(action, kind, id, payload);
	} catch (cause) {
		return managementActionFailure(cause);
	}
	if (action === 'remove') redirect(303, resolve('/admin/courses'));
	if (result.id && (id === 'new' || result.id !== id))
		redirect(303, courseAdminEditorUrl(kind, result.id));
	const messages = {
		save: 'Draft berhasil disimpan.',
		publish: 'Konten berhasil diterbitkan.',
		restore: 'Arsip dipulihkan sebagai draft.',
		remove: ''
	};
	return { message: messages[action] };
}
export async function previewCourseAdminLesson(event: RequestEvent) {
	try {
		let payload: unknown;
		try {
			payload = await event.request.json();
		} catch {
			throw new HttpError(400, 'Konten lesson tidak valid.');
		}
		const input = (payload as { content?: CourseAdminLessonContent } | null)?.content;
		const content = await previewCourseAdminLessonUseCase.exec(input as CourseAdminLessonContent);
		return json({ data: content });
	} catch (cause) {
		if (!(cause instanceof HttpError)) throw cause;
		if (cause.status === 401) redirect(303, resolve('/signin'));
		if (cause.status === 403) redirect(303, resolve('/'));
		return json({ error: cause.message }, { status: cause.status });
	}
}
