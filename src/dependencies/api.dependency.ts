import { getRequestEvent } from '$app/server';
import { HttpClient } from '$lib/http-client';
import { getValidAccessToken, refreshAuthSession } from '$lib/server/auth';

export const apiClient = new HttpClient();

apiClient.onRequest(async (config) => {
	const accessToken = await getValidAccessToken(getRequestEvent());

	if (!accessToken) return config;

	return {
		...config,
		headers: {
			...config.headers,
			Authorization: `Bearer ${accessToken}`
		}
	};
});

apiClient.onResponse(async (response, config) => {
	if (response.status !== 401 || !config.url) return response;

	const event = getRequestEvent();
	const session = await refreshAuthSession(event);
	if (!session) return response;

	const retryConfig: RequestInit = {
		...config,
		headers: {
			...config.headers,
			Authorization: `Bearer ${session.accessToken}`
		}
	};
	delete (retryConfig as typeof config).url;
	delete (retryConfig as typeof config).params;

	return event.fetch(config.url, retryConfig);
});
