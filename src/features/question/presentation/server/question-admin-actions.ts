import { redirect, type RequestEvent } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { readManagementFormPayload, managementActionFailure } from '$lib/server/management-action';
import { manageQuestionAdminContentUseCase } from '$dependencies/question.dependency';
import type {
	QuestionAdminContentAction,
	QuestionAdminContentRecord
} from '../../domain/entities/question-admin.entity';
export async function manageQuestionAdminContent(
	event: RequestEvent,
	action: QuestionAdminContentAction
) {
	const id = event.params.id!;
	let result;
	try {
		const payload =
			action === 'save'
				? (readManagementFormPayload(
						(await event.request.formData()).get('payload')
					) as QuestionAdminContentRecord)
				: undefined;
		result = await manageQuestionAdminContentUseCase.exec(action, id, payload);
	} catch (cause) {
		return managementActionFailure(cause);
	}
	if (action === 'remove') redirect(303, resolve('/admin/question-sets'));
	if (result.id && (id === 'new' || result.id !== id))
		redirect(303, resolve('/(protected)/admin/content/question_set/[id]', { id: result.id }));
	const messages = {
		save: 'Draft berhasil disimpan.',
		publish: 'Konten berhasil diterbitkan.',
		restore: 'Arsip dipulihkan sebagai draft.',
		remove: ''
	};
	return { message: messages[action] };
}
