import { describe, expect, it, vi } from 'vitest';
import { POST } from './+server';

const setAuthState = vi.hoisted(() => vi.fn());
const toAuthState = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/auth-cookie', () => ({ setAuthState, toAuthState }));

function invoke(upstream: Response | Error) {
	const fetch = vi.fn<typeof globalThis.fetch>(async () => {
		if (upstream instanceof Error) throw upstream;
		return upstream;
	});
	const response = POST({
		request: new Request('https://app.example.test/api/auth/google', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id_token: 'tok' })
		}),
		fetch,
		cookies: {}
	} as Parameters<typeof POST>[0]);
	return { fetch, response };
}

describe('POST /api/auth/google', () => {
	it('forwards the ID token to the Go API and stores the session cookie', async () => {
		toAuthState.mockReturnValueOnce({ user: {}, session: {} });
		const { fetch, response } = invoke(Response.json({ data: {} }));
		expect((await response).status).toBe(200);
		expect(fetch.mock.calls[0][0]).toBe('/api/v1/auth/google');
		expect(fetch.mock.calls[0][1]?.body).toBe(JSON.stringify({ id_token: 'tok' }));
		expect(setAuthState).toHaveBeenCalledOnce();
	});

	it('passes upstream errors through without setting a cookie', async () => {
		setAuthState.mockClear();
		const { response } = invoke(
			Response.json({ error: 'token Google tidak valid' }, { status: 401 })
		);
		expect((await response).status).toBe(401);
		expect(setAuthState).not.toHaveBeenCalled();
	});

	it('returns 502 when the API is unreachable', async () => {
		const { response } = invoke(new Error('down'));
		expect((await response).status).toBe(502);
	});
});
