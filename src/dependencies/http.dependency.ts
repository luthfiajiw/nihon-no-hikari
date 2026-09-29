import { getRequestEvent } from '$app/server';
import { HttpClient } from '$lib/http-client';
import { auth } from '$lib/server/auth';

export const httpClient = new HttpClient();

httpClient.onRequest(async (config) => {
	const sessionToken = getRequestEvent().locals.session?.token;
	if (!sessionToken) return config;

	const context = await auth.$context;
	const authSession = await context.internalAdapter.findSession(sessionToken);
	const accessToken: unknown = authSession?.session.accessToken;

	if (typeof accessToken !== 'string' || !accessToken) return config;

	return {
		...config,
		headers: {
			...config.headers,
			Authorization: `Bearer ${accessToken}`
		}
	};
});
