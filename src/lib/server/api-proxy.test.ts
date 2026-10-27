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

	it('forwards bodyless speech-token requests and preserves no-store', async () => {
		const fetch = vi
			.fn<typeof globalThis.fetch>()
			.mockResolvedValue(
				Response.json(
					{ success: true, data: { token: 'temporary' } },
					{ headers: { 'Cache-Control': 'no-store' } }
				)
			);
		const response = await invoke('POST', fetch, {}, '/api/v1/lessons/lesson/speech-token');
		expect(String(fetch.mock.calls[0][0])).toBe(
			'https://api.example.test/api/v1/lessons/lesson/speech-token'
		);
		expect((fetch.mock.calls[0][1]?.body as ArrayBuffer).byteLength).toBe(0);
		expect(response.headers.get('Cache-Control')).toBe('no-store');
		expect(await response.json()).toMatchObject({ data: { token: 'temporary' } });
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

	it.each([
		['POST', '/api/v1/auth/signin', { email: 'invalid', password: 'password' }],
		['POST', '/api/v1/auth/token', { grant_type: 'refresh', token: '' }],
		['POST', '/api/v1/auth/signout', { session_id: '' }],
		['PUT', '/api/v1/courses/course/modules/module/progress', { status: 'invalid' }],
		['PUT', '/api/v1/lessons/lesson/progress', { status: 42 }],
		['POST', '/api/v1/question-sets/set/attempts/attempt/submit', { answers: 'invalid' }],
		['POST', '/api/v1/admin/courses', { title: 'Incomplete' }],
		['PATCH', '/api/v1/admin/courses/course', { title: 'Incomplete' }],
		['POST', '/api/v1/admin/modules', { course_id: 'invalid' }],
		['PATCH', '/api/v1/admin/modules/module', { course_id: 'invalid' }],
		['POST', '/api/v1/admin/lessons', { content: { content: 42 } }],
		['PATCH', '/api/v1/admin/lessons/lesson', { content: { content: 42 } }],
		['POST', '/api/v1/admin/question-sets', { kind: 'invalid' }],
		['PATCH', '/api/v1/admin/question-sets/set', { kind: 'invalid' }],
		['POST', '/api/v1/admin/modules/reorder', { parent_id: 'invalid', ordered_ids: [] }],
		['POST', '/api/v1/admin/lessons/reorder', { parent_id: 'invalid', ordered_ids: [] }],
		['PATCH', '/api/v1/admin/users/user/role', { role: 'Owner' }],
		['POST', '/api/v1/admin/lessons/preview', { content: { content: 42 } }],
		['POST', '/api/v1/admin/templates', { script: 'kanji' }],
		['POST', '/api/v1/admin/templates/preview', { script: 'kanji' }],
		['PATCH', '/api/v1/admin/templates/template', { script: 'kanji' }]
	] as const)(
		'rejects invalid %s %s bodies without contacting upstream',
		async (method, path, body) => {
			const fetch = vi.fn<typeof globalThis.fetch>();
			const response = await invoke(
				method,
				fetch,
				{
					body: JSON.stringify(body),
					headers: { 'Content-Type': 'application/json' }
				},
				path
			);
			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({ error: expect.any(String) });
			expect(fetch).not.toHaveBeenCalled();
		}
	);

	it.each(['', '{', 'null', '[]', '42'])(
		'rejects malformed or non-object JSON %# on a known mutation route',
		async (body) => {
			const fetch = vi.fn<typeof globalThis.fetch>();
			const response = await invoke('PUT', fetch, { body }, '/api/v1/lessons/lesson/progress');
			expect(response.status).toBe(400);
			expect(fetch).not.toHaveBeenCalled();
		}
	);

	it('forwards the validated mutation payload', async () => {
		const fetch = vi
			.fn<typeof globalThis.fetch>()
			.mockResolvedValue(new Response(null, { status: 204 }));
		const body = '{\n  "status": "completed", "untrusted": true\n}';
		const response = await invoke(
			'PUT',
			fetch,
			{
				body,
				headers: { 'Content-Type': 'application/json' }
			},
			'/api/v1/lessons/lesson/progress'
		);
		expect(response.status).toBe(204);
		expect(
			JSON.parse(new TextDecoder().decode(fetch.mock.calls[0][1]?.body as ArrayBuffer))
		).toEqual({ status: 'completed' });
	});

	it.each(['courses', 'modules', 'lessons', 'question-sets'])(
		'keeps empty DELETE and lifecycle POST requests working for %s',
		async (resource) => {
			const fetch = vi
				.fn<typeof globalThis.fetch>()
				.mockImplementation(async () => new Response(null, { status: 204 }));
			await invoke('DELETE', fetch, {}, `/api/v1/admin/${resource}/item`);
			await invoke('POST', fetch, {}, `/api/v1/admin/${resource}/item/publish`);
			await invoke('POST', fetch, {}, `/api/v1/admin/${resource}/item/restore`);
			await invoke('POST', fetch, { body: '{}' }, '/api/v1/question-sets/set/attempts');
			expect(fetch).toHaveBeenCalledTimes(4);
			expect(fetch.mock.calls.slice(0, 3).map(([target]) => String(target))).toEqual([
				`https://api.example.test/api/v1/admin/${resource}/item`,
				`https://api.example.test/api/v1/admin/${resource}/item/publish`,
				`https://api.example.test/api/v1/admin/${resource}/item/restore`
			]);
			for (const [, init] of fetch.mock.calls.slice(0, 3))
				expect((init?.body as ArrayBuffer).byteLength).toBe(0);
		}
	);

	it('forwards normalized lesson content to the new upstream resource URL', async () => {
		const fetch = vi
			.fn<typeof globalThis.fetch>()
			.mockResolvedValue(Response.json({ id: 'lesson' }));
		const response = await invoke(
			'PATCH',
			fetch,
			{
				body: JSON.stringify({
					title: 'Kana',
					slug: 'kana',
					module_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
					content: { content: '<p>あ</p>', audio: 'lesson.mp3' }
				})
			},
			'/api/v1/admin/lessons/lesson%2F1'
		);
		expect(response.status).toBe(200);
		expect(String(fetch.mock.calls[0][0])).toBe(
			'https://api.example.test/api/v1/admin/lessons/lesson%2F1'
		);
		expect(
			JSON.parse(new TextDecoder().decode(fetch.mock.calls[0][1]?.body as ArrayBuffer))
		).toMatchObject({
			content: { content: '<p>あ</p>', tips: '', audio: 'lesson.mp3' }
		});
	});

	it('reports an oversized SVG as 413 rather than a gateway error', async () => {
		const fetch = vi.fn<typeof globalThis.fetch>();
		const response = await invoke(
			'POST',
			fetch,
			{
				body: JSON.stringify({
					script: 'hiragana',
					character: 'あ',
					romaji: 'a',
					source_version: 'test',
					svg_content: 'あ'.repeat(Math.ceil((256 * 1024) / 3))
				})
			},
			'/api/v1/admin/templates/preview'
		);
		expect(response.status).toBe(413);
		expect(fetch).not.toHaveBeenCalled();
	});

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
