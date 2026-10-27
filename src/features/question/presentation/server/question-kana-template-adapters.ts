import { HttpError } from '$lib/http/http-error';
import { error, fail, json, redirect, type RequestEvent } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { questionKanaTemplatesUseCase } from '$dependencies/question.dependency';

import {
	QUESTION_MAX_KANA_SVG_BYTES,
	type QuestionKanaTemplateInput
} from '$features/question/domain/entities/question-kana-template.entity';

function accessError(cause: HttpError): never {
	if (cause.status === 401) redirect(303, resolve('/signin'));
	if (cause.status === 403) redirect(303, resolve('/'));
	error(cause.status, cause.message);
}

export async function loadQuestionKanaTemplates() {
	try {
		return { templates: await questionKanaTemplatesUseCase.list() };
	} catch (cause) {
		if (cause instanceof HttpError) accessError(cause);
		throw cause;
	}
}

export async function loadQuestionKanaTemplateEditor(event: RequestEvent) {
	try {
		return {
			record:
				event.params.id === 'new'
					? null
					: await questionKanaTemplatesUseCase.detail(event.params.id!)
		};
	} catch (cause) {
		if (cause instanceof HttpError) accessError(cause);
		throw cause;
	}
}

export async function saveQuestionKanaTemplate(event: RequestEvent) {
	let saved;
	try {
		const form = await event.request.formData();
		const upload = form.get('svg_file');
		let svg: string | undefined;
		if (upload instanceof File && upload.name !== '') {
			if (upload.size === 0) throw new HttpError(400, 'File SVG kosong.');
			if (upload.size > QUESTION_MAX_KANA_SVG_BYTES)
				throw new HttpError(413, 'Ukuran SVG maksimal 256 KiB.');
			svg = await upload.text();
		}
		saved = await questionKanaTemplatesUseCase.save(
			event.params.id === 'new' ? null : event.params.id!,
			{
				script: form.get('script'),
				character: form.get('character'),
				romaji: form.get('romaji'),
				source_version: form.get('source_version'),
				...(svg !== undefined ? { svg_content: svg } : {})
			} as QuestionKanaTemplateInput
		);
	} catch (cause) {
		if (!(cause instanceof HttpError)) throw cause;
		if (cause.status === 401) redirect(303, resolve('/signin'));
		if (cause.status === 403) redirect(303, resolve('/'));
		return fail(cause.status, { message: cause.message });
	}
	if (event.params.id === 'new')
		redirect(303, resolve('/(protected)/admin/kana-templates/[id]', { id: saved.id }));
	return { message: 'Template kana berhasil disimpan.' };
}

export async function previewQuestionKanaTemplate(event: RequestEvent) {
	try {
		let body: unknown;
		try {
			body = await event.request.json();
		} catch {
			throw new HttpError(400, 'Data template tidak valid.');
		}
		return json({
			data: await questionKanaTemplatesUseCase.preview(body as QuestionKanaTemplateInput)
		});
	} catch (cause) {
		if (!(cause instanceof HttpError)) throw cause;
		return json({ error: cause.message }, { status: cause.status });
	}
}
