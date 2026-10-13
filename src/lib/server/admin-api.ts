import { env } from '$env/dynamic/private';
import { getValidAccessToken } from '$lib/server/auth';
import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function adminRequest(event: RequestEvent, path: string, init: RequestInit = {}): Promise<Response> {
	const token = await getValidAccessToken(event);
	if (!token) redirect(303, '/signin');
	const base = env.API_BASE_URL?.replace(/\/$/, '');
	if (!base) error(500, 'API_BASE_URL belum dikonfigurasi.');
	let response: Response;
	try {
		response = await event.fetch(`${base}/v1/admin${path}`, {
			...init,
			headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers }
		});
	} catch { error(502, 'Gagal terhubung ke server.'); }
	if (response.status === 401) redirect(303, '/signin');
	if (response.status === 403) redirect(303, '/');
	return response;
}

export async function adminData<T>(event: RequestEvent, path: string): Promise<T> {
	const response = await adminRequest(event, path);
	if (!response.ok) error(response.status, 'Gagal mengambil data admin.');
	return (await response.json()) as T;
}
