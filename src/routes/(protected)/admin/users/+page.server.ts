import { env } from '$env/dynamic/private';
import { getValidAccessToken } from '$lib/server/auth';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

interface ManagedUser {
	id: string;
	email: string;
	display_name: string;
	role: 'User' | 'Admin';
}

function apiUrl(): string {
	const base = env.API_BASE_URL?.replace(/\/$/, '');
	if (!base) error(500, 'API_BASE_URL belum dikonfigurasi.');
	return `${base}/v1/admin/users`;
}

export const load: PageServerLoad = async (event) => {
	const token = await getValidAccessToken(event);
	if (!token) redirect(303, '/signin');

	let response: Response;
	try {
		response = await event.fetch(apiUrl(), { headers: { Authorization: `Bearer ${token}` } });
	} catch {
		error(502, 'Gagal terhubung ke server.');
	}
	if (response.status === 403) redirect(303, '/');
	if (!response.ok) error(response.status, 'Gagal mengambil daftar pengguna.');
	const payload = (await response.json()) as { data: ManagedUser[] };
	return { users: payload.data };
};

export const actions: Actions = {
	changeRole: async (event) => {
		if (event.locals.user?.role !== 'Admin')
			return fail(403, { message: 'Akses tidak diizinkan.' });
		const form = await event.request.formData();
		const userId = form.get('userId');
		const role = form.get('role');
		if (
			typeof userId !== 'string' ||
			!/^[0-9a-f-]{36}$/i.test(userId) ||
			(role !== 'User' && role !== 'Admin')
		) {
			return fail(400, { message: 'Data perubahan role tidak valid.' });
		}
		const token = await getValidAccessToken(event);
		if (!token) redirect(303, '/signin');
		let response: Response;
		try {
			response = await event.fetch(`${apiUrl()}/${userId}/role`, {
				method: 'PATCH',
				headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
				body: JSON.stringify({ role })
			});
		} catch {
			return fail(502, { message: 'Gagal terhubung ke server.' });
		}
		if (response.status === 403) return fail(403, { message: 'Akses tidak diizinkan.' });
		if (!response.ok) {
			const payload = await response.json().catch(() => null);
			return fail(response.status, { message: payload?.error ?? 'Gagal mengubah role.' });
		}
		return { message: 'Role pengguna berhasil diperbarui.' };
	}
};
