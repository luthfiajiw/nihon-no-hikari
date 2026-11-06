import { describe, expect, it, vi } from 'vitest';
import { UserSource } from './user.source';

function sourceWith(response: Response) {
	const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(response);
	return { source: new UserSource(fetch), fetch };
}

describe('UserSource profile transport', () => {
	it('fetches profile data from /api/v1/user/profile', async () => {
		const mockProfile = {
			id: 'u-1',
			email: 'user@example.com',
			display_name: 'Ren',
			role: 'User',
			has_password: true,
			google_linked: false,
			sessions: []
		};
		const { source, fetch } = sourceWith(Response.json({ data: mockProfile }));
		const result = await source.getProfile();

		expect(result).toEqual(mockProfile);
		expect(fetch).toHaveBeenCalledWith('/api/v1/user/profile', expect.any(Object));
	});

	it('updates profile via PATCH /api/v1/user/profile', async () => {
		const mockUser = {
			id: 'u-1',
			email: 'user@example.com',
			display_name: 'Ren Tanaka',
			avatar_url: 'preset:kitsune',
			role: 'User'
		};
		const { source, fetch } = sourceWith(Response.json({ data: mockUser }));
		const result = await source.updateProfile({
			display_name: 'Ren Tanaka',
			avatar_url: 'preset:kitsune'
		});

		expect(result).toEqual(mockUser);
		expect(fetch).toHaveBeenCalledWith(
			'/api/v1/user/profile',
			expect.objectContaining({
				method: 'PATCH',
				body: JSON.stringify({ display_name: 'Ren Tanaka', avatar_url: 'preset:kitsune' })
			})
		);
	});

	it('changes password via POST /api/v1/user/password', async () => {
		const { source, fetch } = sourceWith(Response.json({ success: true }));
		await source.changePassword({
			current_password: 'old123',
			new_password: 'new123456',
			confirm_password: 'new123456'
		});

		expect(fetch).toHaveBeenCalledWith(
			'/api/v1/user/password',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({
					current_password: 'old123',
					new_password: 'new123456',
					confirm_password: 'new123456'
				})
			})
		);
	});

	it('revokes other sessions via DELETE /api/v1/user/sessions/other', async () => {
		const { source, fetch } = sourceWith(Response.json({ success: true }));
		await source.revokeOtherSessions();

		expect(fetch).toHaveBeenCalledWith(
			'/api/v1/user/sessions/other',
			expect.objectContaining({ method: 'DELETE' })
		);
	});
});
