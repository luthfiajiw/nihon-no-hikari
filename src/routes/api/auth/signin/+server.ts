import { env } from '$env/dynamic/private';
import { setAuthState, toAuthState } from '$lib/server/auth-cookie';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, fetch, cookies }) => {
	const apiBaseUrl = env.API_BASE_URL?.replace(/\/$/, '');
	if (!apiBaseUrl) {
		return json({ error: 'API_BASE_URL belum dikonfigurasi.' }, { status: 500 });
	}

	let response: Response;
	try {
		response = await fetch(`${apiBaseUrl}/v1/auth/signin`, {
			method: 'POST',
			headers: {
				Accept: request.headers.get('accept') ?? 'application/json',
				'Content-Type': request.headers.get('content-type') ?? 'application/json'
			},
			body: await request.text()
		});
	} catch {
		return json({ error: 'Gagal terhubung ke server. Silakan coba lagi.' }, { status: 502 });
	}

	if (response.ok) {
		const state = toAuthState(await response.clone().json().catch(() => null));
		if (state) setAuthState(cookies, state);
	}

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});
};
