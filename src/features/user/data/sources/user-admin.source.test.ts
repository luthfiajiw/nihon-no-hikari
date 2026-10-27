import { describe, expect, it, vi } from 'vitest';
import { UserSource } from './user.source';
function sourceWith(response: Response) {
	const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(response);
	return { source: new UserSource(fetch), fetch };
}

describe('user administrative transport', () => {
	it('unwraps the administrative user list', async () => {
		const users = [{ id: 'user', email: 'user@example.test', display_name: 'User', role: 'User' }];
		const { source, fetch } = sourceWith(Response.json({ data: users }));
		await expect(source.getAdminUsers()).resolves.toEqual(users);
		expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/v1/admin/users', expect.any(Object));
	});
	it('encodes the user id and preserves the role update contract', async () => {
		const { source, fetch } = sourceWith(new Response(null, { status: 204 }));
		await expect(source.changeAdminRole('user/1', 'Admin')).resolves.toBeUndefined();
		expect(fetch).toHaveBeenCalledExactlyOnceWith(
			'/api/v1/admin/users/user%2F1/role',
			expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ role: 'Admin' }) })
		);
	});
	it('preserves the status when an error response is not JSON', async () => {
		const { source } = sourceWith(new Response('Bad gateway', { status: 502 }));
		await expect(source.getAdminUsers()).rejects.toMatchObject({
			status: 502,
			message: 'Operasi admin gagal. Silakan coba lagi.'
		});
	});
	it('reports connection failures without exposing transport details', async () => {
		const fetch = vi
			.fn<typeof globalThis.fetch>()
			.mockRejectedValue(new Error('connection refused'));
		const source = new UserSource(fetch);
		await expect(source.getAdminUsers()).rejects.toMatchObject({
			status: 502,
			message: 'Gagal terhubung ke server.'
		});
	});
});
