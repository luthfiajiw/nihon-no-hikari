import { error, fail, json, redirect, type RequestEvent } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { kanaTemplatesUseCase } from '$dependencies/admin.dependency';
import { AdminError } from '../../domain/entities/admin.entity';
import {
	MAX_KANA_SVG_BYTES,
	type KanaTemplateInput
} from '../../domain/entities/kana-template.entity';

function accessError(cause: AdminError): never {
	if (cause.status === 401) redirect(303, resolve('/signin'));
	if (cause.status === 403) redirect(303, resolve('/'));
	error(cause.status, cause.message);
}

export async function loadKanaTemplates() {
	try {
		return { templates: await kanaTemplatesUseCase.list() };
	} catch (cause) {
		if (cause instanceof AdminError) accessError(cause);
		throw cause;
	}
}

export async function loadKanaTemplateEditor(event: RequestEvent) {
	try {
		return {
			record: event.params.id === 'new' ? null : await kanaTemplatesUseCase.detail(event.params.id!)
		};
	} catch (cause) {
		if (cause instanceof AdminError) accessError(cause);
		throw cause;
	}
}

export async function saveKanaTemplate(event: RequestEvent) {
	let saved;
	try {
		const form = await event.request.formData();
		const upload = form.get('svg_file');
		let svg: string | undefined;
		if (upload instanceof File && upload.name !== '') {
			if (upload.size === 0) throw new AdminError(400, 'File SVG kosong.');
			if (upload.size > MAX_KANA_SVG_BYTES)
				throw new AdminError(413, 'Ukuran SVG maksimal 256 KiB.');
			svg = await upload.text();
		}
		saved = await kanaTemplatesUseCase.save(event.params.id === 'new' ? null : event.params.id!, {
			script: form.get('script'),
			character: form.get('character'),
			romaji: form.get('romaji'),
			source_version: form.get('source_version'),
			...(svg !== undefined ? { svg_content: svg } : {})
		} as KanaTemplateInput);
	} catch (cause) {
		if (!(cause instanceof AdminError)) throw cause;
		if (cause.status === 401) redirect(303, resolve('/signin'));
		if (cause.status === 403) redirect(303, resolve('/'));
		return fail(cause.status, { message: cause.message });
	}
	if (event.params.id === 'new')
		redirect(303, resolve('/(protected)/admin/kana-templates/[id]', { id: saved.id }));
	return { message: 'Template kana berhasil disimpan.' };
}

export async function previewKanaTemplate(event: RequestEvent) {
	try {
		let body: unknown;
		try {
			body = await event.request.json();
		} catch {
			throw new AdminError(400, 'Data template tidak valid.');
		}
		return json({ data: await kanaTemplatesUseCase.preview(body as KanaTemplateInput) });
	} catch (cause) {
		if (!(cause instanceof AdminError)) throw cause;
		return json({ error: cause.message }, { status: cause.status });
	}
}
