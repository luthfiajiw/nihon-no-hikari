import type { RequestEvent, ServerLoadEvent } from '@sveltejs/kit';
import {
	getQuestionAdminSetsUseCase,
	getQuestionAdminEditorUseCase
} from '$dependencies/question.dependency';
import { managementLoad } from '$lib/server/management-load';
import { parsePaginationParams } from '$lib/models/pagination.model';

export async function loadQuestionAdminSets(event: ServerLoadEvent) {
	event.depends('question:sets');
	const params = parsePaginationParams(event.url);
	const skill = event.url.searchParams.get('skill') || undefined;
	const kind = event.url.searchParams.get('kind') || undefined;
	const status = event.url.searchParams.get('status') || undefined;
	const result = await managementLoad(() =>
		getQuestionAdminSetsUseCase.exec({ ...params, skill, kind, status })
	);
	return { sets: result.items, meta: result.meta };
}
export function loadQuestionAdminEditor(event: RequestEvent) {
	return managementLoad(() =>
		getQuestionAdminEditorUseCase.exec(event.params.id!, event.url.searchParams.get('parent'))
	);
}
