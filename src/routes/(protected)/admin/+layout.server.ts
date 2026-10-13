import { env } from '$env/dynamic/private';
import { getValidAccessToken } from '$lib/server/auth';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const token = await getValidAccessToken(event);
	if (!token) redirect(303, '/signin');
	const base = env.API_BASE_URL?.replace(/\/$/, '');
	if (!base) error(500, 'API_BASE_URL belum dikonfigurasi.');
	let response: Response;
	try {
		response = await event.fetch(`${base}/v1/admin/me`, { headers: { Authorization: `Bearer ${token}` } });
	} catch { error(502, 'Gagal terhubung ke server.'); }
	if (response.status === 401) redirect(303, '/signin');
	if (response.status === 403) redirect(303, '/');
	if (!response.ok) error(response.status, 'Gagal memeriksa hak akses admin.');
};
