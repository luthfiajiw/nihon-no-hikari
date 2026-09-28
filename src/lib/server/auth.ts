// src/lib/server/auth.ts
import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { apiAuth } from './plugins/api-auth';

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	emailAndPassword: {
		enabled: false
	},
	session: {
		cookieCache: {
			enabled: true,
			strategy: 'jwe',
			maxAge: 60 * 60 * 24 * 7,
			refreshCache: true
		},
		additionalFields: {
			externalSessionId: { type: 'string', required: false, returned: false },
			accessToken: { type: 'string', required: false, returned: false },
			accessTokenExpiresAt: { type: 'date', required: false, returned: false },
			refreshToken: { type: 'string', required: false, returned: false },
			refreshTokenExpiresAt: { type: 'date', required: false, returned: false }
		}
	},
	plugins: [apiAuth(), sveltekitCookies(getRequestEvent)]
});
