import { HttpError } from '$lib/http/http-error';

export async function requestJson<T>(
	fetcher: typeof fetch,
	path: string,
	options: RequestInit = {}
): Promise<T> {
	try {
		const response = await fetcher(path, {
			...options,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				...Object.fromEntries(new Headers(options.headers))
			}
		});
		if (response.status === 204) return undefined as T;
		const data = await response.json().catch(() => ({}));
		if (!response.ok)
			throw new HttpError(
				response.status,
				data?.error || data?.message || 'Operasi admin gagal. Silakan coba lagi.'
			);
		return data as T;
	} catch (cause) {
		if (cause instanceof HttpError) throw cause;
		throw new HttpError(502, 'Gagal terhubung ke server.');
	}
}
