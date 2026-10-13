import { adminData, adminRequest } from '$lib/server/admin-api';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const kinds = new Set(['course', 'module', 'lesson', 'question_set']);
function resourcePath(kind: string, id?: string): string {
	return `/content/${encodeURIComponent(kind)}${id ? `/${encodeURIComponent(id)}` : ''}`;
}

export const load: PageServerLoad = async (event) => {
	const { kind, id } = event.params;
	if (!kinds.has(kind)) redirect(303, '/admin');
	const [catalog, levels, templates, item] = await Promise.all([
		kind === 'course'
			? Promise.resolve({ data: {} as Record<string, Record<string, unknown>[]> })
			: adminData<{ data: Record<string, Record<string, unknown>[]> }>(event, '/catalog'),
		kind === 'course'
			? adminData<{ data: Record<string, unknown>[] }>(event, '/levels')
			: Promise.resolve({ data: [] }),
		kind === 'question_set'
			? adminData<{ data: Record<string, unknown>[] }>(event, '/templates')
			: Promise.resolve({ data: [] }),
		id === 'new'
			? Promise.resolve({ data: null, draft: null })
			: adminData<{ data: Record<string, unknown>; draft: Record<string, unknown> | null }>(
					event,
					resourcePath(kind, id)
				)
	]);
	return {
		kind,
		id,
		parentId: event.url.searchParams.get('parent'),
		record: item.data,
		draft: item.draft,
		catalog: catalog.data,
		levels: levels.data,
		templates: templates.data
	};
};

async function message(response: Response): Promise<string> {
	const payload = await response.json().catch(() => null);
	return payload?.error ?? 'Operasi gagal. Silakan coba lagi.';
}

export const actions: Actions = {
	save: async (event) => {
		const { kind, id } = event.params;
		if (!kinds.has(kind)) return fail(400, { message: 'Jenis konten tidak valid.' });
		const form = await event.request.formData();
		const payload = form.get('payload');
		if (typeof payload !== 'string') return fail(400, { message: 'Form tidak lengkap.' });
		try {
			JSON.parse(payload);
		} catch {
			return fail(400, { message: 'Data form tidak valid.' });
		}
		const isNew = id === 'new';
		const response = await adminRequest(event, resourcePath(kind, isNew ? undefined : id), {
			method: isNew ? 'POST' : 'PATCH',
			body: payload
		});
		if (!response.ok) return fail(response.status, { message: await message(response) });
		if (isNew) {
			const result = (await response.json()) as { id: string };
			redirect(303, `/admin/content/${kind}/${result.id}`);
		}
		return { message: 'Draft berhasil disimpan.' };
	},
	publish: async (event) => {
		const { kind, id } = event.params;
		if (!kinds.has(kind) || id === 'new')
			return fail(400, { message: 'Simpan draft terlebih dahulu.' });
		const response = await adminRequest(event, `${resourcePath(kind, id)}/publish`, {
			method: 'POST'
		});
		if (!response.ok) return fail(response.status, { message: await message(response) });
		const result = (await response.json()) as { id?: string };
		if (result.id && result.id !== id) redirect(303, `/admin/content/${kind}/${result.id}`);
		return { message: 'Konten berhasil diterbitkan.' };
	},
	remove: async (event) => {
		const { kind, id } = event.params;
		if (!kinds.has(kind) || id === 'new') return fail(400, { message: 'Konten tidak valid.' });
		const response = await adminRequest(event, resourcePath(kind, id), { method: 'DELETE' });
		if (!response.ok) return fail(response.status, { message: await message(response) });
		redirect(303, kind === 'question_set' ? '/admin/question-sets' : '/admin/courses');
	},
	restore: async (event) => {
		const { kind, id } = event.params;
		if (!kinds.has(kind) || id === 'new') return fail(400, { message: 'Konten tidak valid.' });
		const response = await adminRequest(event, `${resourcePath(kind, id)}/restore`, {
			method: 'POST'
		});
		if (!response.ok) return fail(response.status, { message: await message(response) });
		return { message: 'Arsip dipulihkan sebagai draft.' };
	}
};
