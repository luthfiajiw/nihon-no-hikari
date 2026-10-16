import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('$env/dynamic/private', () => ({ env: { API_BASE_URL: 'https://api.example.test/api/' } }));
import { env } from '$env/dynamic/private';
import * as handlers from '../../routes/api/v1/[...path]/+server';

function invoke(
	method: keyof typeof handlers,
	fetch: typeof globalThis.fetch,
	init: RequestInit = {},
	path = '/api/v1/courses'
) {
	const url = new URL(path, 'https://app.example.test');
	return handlers[method]({
		url,
		request: new Request(url, { ...init, method }),
		fetch
	} as Parameters<typeof handlers.GET>[0]);
}

describe('API proxy', () => {
	beforeEach(() => {
		env.API_BASE_URL = 'https://api.example.test/api/';
	});

	it('preserves encoded paths and queries while stripping untrusted credentials', async () => {
		const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(Response.json({ data: [] }));
		await invoke(
			'GET',
			fetch,
			{
				headers: {
					Cookie: 'nnh.auth=secret',
					Authorization: 'Bearer spoofed',
					Host: 'wrong.test',
					Connection: 'keep-alive, x-transport',
					'X-Transport': 'private',
					Accept: 'application/json'
				}
			},
			'/api/v1/courses/course%2F1?filter=a%2Fb&filter=%E6%97%A5&url=https://evil.test'
		);
		const [target, init] = fetch.mock.calls[0];
		expect(String(target)).toBe(
			'https://api.example.test/api/v1/courses/course%2F1?filter=a%2Fb&filter=%E6%97%A5&url=https://evil.test'
		);
		const headers = new Headers(init?.headers);
		for (const name of ['cookie', 'authorization', 'host', 'connection', 'x-transport'])
			expect(headers.has(name)).toBe(false);
		expect(headers.get('accept')).toBe('application/json');
		expect(init).toMatchObject({ credentials: 'omit', redirect: 'manual' });
	});

	it.each(['POST', 'PUT', 'PATCH', 'DELETE'] as const)(
		'preserves the raw %s body and content type',
		async (method) => {
			const fetch = vi
				.fn<typeof globalThis.fetch>()
				.mockResolvedValue(new Response(null, { status: 204 }));
			const body = new Uint8Array([0, 42, 128, 255]);
			const response = await invoke(method, fetch, {
				body,
				headers: { 'Content-Type': 'application/octet-stream' }
			});
			const init = fetch.mock.calls[0][1];
			expect(new Uint8Array(init?.body as ArrayBuffer)).toEqual(body);
			expect(new Headers(init?.headers).get('content-type')).toBe('application/octet-stream');
			expect(response.status).toBe(204);
			expect(await response.text()).toBe('');
		}
	);

	it('preserves API errors, status and relevant response headers', async () => {
		const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
			Response.json(
				{ error: 'Already used' },
				{
					status: 409,
					headers: {
						'Retry-After': '15',
						'Set-Cookie': 'upstream=secret',
						'Content-Encoding': 'gzip',
						'Content-Length': '999',
						Connection: 'close'
					}
				}
			)
		);
		const response = await invoke('GET', fetch);
		expect(response.status).toBe(409);
		expect(await response.json()).toEqual({ error: 'Already used' });
		expect(response.headers.get('retry-after')).toBe('15');
		for (const header of ['set-cookie', 'content-length', 'content-encoding', 'connection'])
			expect(response.headers.has(header)).toBe(false);
	});

	it('forwards HEAD and OPTIONS with their original status', async () => {
		const fetch = vi
			.fn<typeof globalThis.fetch>()
			.mockImplementation(async () => new Response('body', { status: 200 }));
		const head = await invoke('HEAD', fetch);
		expect(await head.text()).toBe('');
		const options = await invoke('OPTIONS', fetch);
		expect(options.status).toBe(200);
		expect(fetch.mock.calls.map(([, init]) => init?.method)).toEqual(['HEAD', 'OPTIONS']);
	});

	it.each([
		'',
		'invalid',
		'ftp://api.test/api',
		'https://user:pass@api.test/api',
		'https://api.test/api?query=1',
		'https://app.example.test/api',
		'https://app.example.test/api/v1/api',
		'https://app.example.test/id/api'
	])('returns 500 for invalid configuration %s', async (value) => {
		env.API_BASE_URL = value;
		const fetch = vi.fn<typeof globalThis.fetch>();
		const response = await invoke('GET', fetch);
		expect(response.status).toBe(500);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('returns a JSON 502 for connection failures', async () => {
		const fetch = vi.fn<typeof globalThis.fetch>().mockRejectedValue(new Error('ECONNREFUSED'));
		const response = await invoke('GET', fetch);
		expect(response.status).toBe(502);
		expect(await response.json()).toEqual({
			error: 'Gagal terhubung ke server. Silakan coba lagi.'
		});
	});
});
