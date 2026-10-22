import { json } from '@sveltejs/kit';
import { getApiBaseUrl, isApiRequest, proxyHeaders } from '$lib/server/api-proxy';
import type { RequestHandler } from './$types';
import { validateApiRequestBody } from '$lib/server/api-request-validation';
import { RequestValidationError } from '$lib/server/validation';

const proxy: RequestHandler = async ({ request, url, fetch }) => {
	let target: URL;
	try {
		const base = getApiBaseUrl();
		// Use the encoded URL pathname, rather than decoded route params.
		const suffix = url.pathname.slice(url.pathname.indexOf('/api/v1') + '/api'.length);
		target = new URL(`${base.toString().replace(/\/$/, '')}${suffix}${url.search}`);
		// Same-origin event.fetch dispatches back into SvelteKit instead of the backend.
		if (!isApiRequest(target, base) || target.origin === url.origin) {
			throw new Error('Invalid upstream');
		}
	} catch {
		return json({ error: 'API_BASE_URL belum dikonfigurasi atau tidak valid.' }, { status: 500 });
	}

	let body: ArrayBuffer | undefined;
	try {
		if (!['GET', 'HEAD'].includes(request.method)) {
			body = await request.arrayBuffer();
			body = validateApiRequestBody(request.method, url.pathname, body);
		}
	} catch (cause) {
		if (cause instanceof RequestValidationError)
			return json({ error: cause.message }, { status: cause.status });
		throw cause;
	}

	try {
		const response = await fetch(target, {
			method: request.method,
			headers: proxyHeaders(request.headers),
			body,
			credentials: 'omit',
			redirect: 'manual',
			signal: request.signal
		});
		return new Response(request.method === 'HEAD' ? null : response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: proxyHeaders(response.headers, true)
		});
	} catch {
		return json({ error: 'Gagal terhubung ke server. Silakan coba lagi.' }, { status: 502 });
	}
};

export const GET = proxy;
export const HEAD = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
