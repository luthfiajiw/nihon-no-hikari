import type { RequestEvent } from '@sveltejs/kit';
import {
	getQuestionAdminSetsUseCase,
	getQuestionAdminEditorUseCase
} from '$dependencies/question.dependency';
import { managementLoad } from '$lib/server/management-load';
export async function loadQuestionAdminSets() {
	return { sets: await managementLoad(() => getQuestionAdminSetsUseCase.exec()) };
}
export function loadQuestionAdminEditor(event: RequestEvent) {
	return managementLoad(() =>
		getQuestionAdminEditorUseCase.exec(event.params.id!, event.url.searchParams.get('parent'))
	);
}
