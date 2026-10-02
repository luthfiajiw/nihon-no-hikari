import { clearAuthState } from '$lib/server/auth-cookie';
import { revokeAuthSession } from '$lib/server/auth';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	const revoked = await revokeAuthSession(event);

	clearAuthState(event.cookies);
	event.locals.user = null;
	event.locals.session = null;

	return json({
		success: true,
		revoked,
		message: revoked
			? 'Berhasil keluar.'
			: 'Session lokal dihapus, tetapi server gagal mengonfirmasi pencabutan session.'
	});
};
