import { adminRequest } from '$lib/server/admin-api';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	const response = await adminRequest(event, '/lesson-content/preview', { method: 'POST', body: await event.request.text() });
	return new Response(response.body, { status: response.status, headers: { 'content-type': 'application/json' } });
};
