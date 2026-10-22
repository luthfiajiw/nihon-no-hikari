import { setAuthState, toAuthState } from '$lib/server/auth-cookie';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, fetch, cookies }) => {
	let response: Response;
	try {
		response = await fetch('/api/v1/auth/signin', {
			method: 'POST',
			headers: {
				Accept: request.headers.get('accept') ?? 'application/json',
				'Content-Type': 'application/json'
			},
			// The API proxy validates and normalizes credentials once before forwarding.
			body: await request.text()
		});
	} catch {
		return json({ error: 'Gagal terhubung ke server. Silakan coba lagi.' }, { status: 502 });
	}

	if (response.ok) {
		const state = toAuthState(
			await response
				.clone()
				.json()
				.catch(() => null)
		);
		if (!state) return json({ error: 'Respons autentikasi tidak valid.' }, { status: 502 });
		setAuthState(cookies, state);
	}

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});
};
