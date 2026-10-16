import { env } from '$env/dynamic/private';

export function getApiBaseUrl(): URL {
	if (!env.API_BASE_URL) throw new Error('API_BASE_URL belum dikonfigurasi.');
	const base = new URL(env.API_BASE_URL);
	if (
		!['http:', 'https:'].includes(base.protocol) ||
		base.username ||
		base.password ||
		base.search ||
		base.hash
	)
		throw new Error('API_BASE_URL tidak valid.');
	base.pathname = base.pathname.replace(/\/+$/, '');
	return base;
}

export function isApiRequest(url: URL, base: URL): boolean {
	const prefix = `${base.pathname.replace(/\/$/, '')}/v1`;
	return (
		url.origin === base.origin && (url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))
	);
}

export function isPublicAuthRequest(url: URL, base: URL): boolean {
	const path = url.pathname.replace(/\/$/, '');
	return ['register', 'signin', 'token', 'signout'].some(
		(name) => path === `${base.pathname.replace(/\/$/, '')}/v1/auth/${name}`
	);
}

// Fetch decodes compressed responses. Content lengths/encodings from the upstream
// must not describe the decoded body returned by the SvelteKit endpoint.
export function proxyHeaders(headers: Headers, response = false): Headers {
	const result = new Headers(headers);
	const connectionHeaders = (result.get('connection') ?? '').split(',').map((name) => name.trim());
	for (const name of [
		...connectionHeaders,
		'connection',
		'keep-alive',
		'proxy-authenticate',
		'proxy-authorization',
		'te',
		'trailer',
		'transfer-encoding',
		'upgrade',
		'content-length',
		'cookie',
		'authorization',
		'host',
		'set-cookie',
		...(response ? ['content-encoding'] : ['origin', 'referer'])
	]) {
		if (name) result.delete(name);
	}
	return result;
}
