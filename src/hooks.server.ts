import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getValidAccessToken, initializeAuthLocals, refreshAuthSession } from '$lib/server/auth';
import { getApiBaseUrl, isApiRequest, isPublicAuthRequest } from '$lib/server/api-proxy';
import { sequence } from '@sveltejs/kit/hooks';
import { json, type Handle, type HandleFetch } from '@sveltejs/kit';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

const handleAuth: Handle = async ({ event, resolve }) => {
	initializeAuthLocals(event);
	return resolve(event);
};

export const handle: Handle = sequence(handleParaglide, handleAuth);

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	let base: URL;
	try {
		base = getApiBaseUrl();
	} catch {
		return fetch(request);
	}
	const url = new URL(request.url);
	if (!isApiRequest(url, base)) return fetch(request);

	request = new Request(request, { credentials: 'omit' });
	request.headers.delete('authorization');
	request.headers.delete('cookie');
	if (isPublicAuthRequest(url, base)) return fetch(request);

	const token = await getValidAccessToken(event);
	if (!token) return json({ error: 'Silakan masuk kembali.' }, { status: 401 });

	request.headers.set('authorization', `Bearer ${token}`);
	const retry = request.clone();
	const response = await fetch(request);
	if (response.status !== 401) return response;

	const session = await refreshAuthSession(event);
	if (!session) return response;
	await response.body?.cancel();
	retry.headers.set('authorization', `Bearer ${session.accessToken}`);
	// The hook's fetch bypasses handleFetch, so a second 401 cannot retry again.
	return fetch(retry);
};
