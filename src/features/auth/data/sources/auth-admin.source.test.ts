import { describe, expect, it, vi } from 'vitest';
import { AuthSource } from './auth.source';
function sourceWith(response: Response) {
	const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(response);
	return { source: new AuthSource(fetch), fetch };
}

describe('auth administrative transport', () => {
	it('checks access using the authenticated admin endpoint', async () => {
		const { source, fetch } = sourceWith(new Response(null, { status: 204 }));
		await expect(source.checkAdminAccess()).resolves.toBeUndefined();
		expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/v1/admin/me', expect.any(Object));
	});
	it.each([401, 403])('preserves access failure %s', async (status) => {
		const { source } = sourceWith(Response.json({ error: 'Akses tidak diizinkan.' }, { status }));
		await expect(source.checkAdminAccess()).rejects.toMatchObject({ status });
	});
});
