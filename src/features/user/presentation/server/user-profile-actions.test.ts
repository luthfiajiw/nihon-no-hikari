import { describe, expect, it, vi } from 'vitest';
import { unlinkGoogle } from './user-profile-actions';
import { HttpError } from '$lib/http/http-error';
import type { RequestEvent } from '@sveltejs/kit';

const mockUnlinkExec = vi.fn();
vi.mock('$dependencies/user.dependency', () => ({
	updateUserProfileUseCase: { exec: vi.fn() },
	changeUserPasswordUseCase: { exec: vi.fn() },
	revokeOtherSessionsUseCase: { exec: vi.fn() },
	requestLinkGoogleCodeUseCase: { exec: vi.fn() },
	verifyLinkGoogleCodeUseCase: { exec: vi.fn() },
	linkUserGoogleUseCase: { exec: vi.fn() },
	unlinkUserGoogleUseCase: { exec: (...args: unknown[]) => mockUnlinkExec(...args) }
}));

function createEvent(overrides: {
	user?: unknown;
	formData?: Record<string, string>;
}): RequestEvent {
	const fd = new FormData();
	if (overrides.formData) {
		for (const [k, v] of Object.entries(overrides.formData)) {
			fd.append(k, v);
		}
	}
	return {
		locals: {
			user: overrides.user !== undefined ? overrides.user : { id: 'u1', email: 'test@example.com' },
			session: { id: 's1' }
		},
		request: {
			formData: vi.fn().mockResolvedValue(fd)
		}
	} as unknown as RequestEvent;
}

describe('unlinkGoogle action', () => {
	it('returns 401 fail when user is not authenticated', async () => {
		const event = createEvent({ user: null });
		const result = await unlinkGoogle(event);
		expect(result).toMatchObject({
			status: 401,
			data: { error: 'Silakan masuk terlebih dahulu.' }
		});
	});

	it('returns 400 fail when current_password is missing', async () => {
		const event = createEvent({ formData: {} });
		const result = await unlinkGoogle(event);
		expect(result).toMatchObject({
			status: 400,
			data: { action: 'unlinkGoogle', error: 'Kata sandi saat ini harus diisi.' }
		});
	});

	it('returns 400 fail with upstream HttpError message when use case rejects', async () => {
		mockUnlinkExec.mockRejectedValueOnce(new HttpError(400, 'Kata sandi saat ini salah.'));
		const event = createEvent({ formData: { current_password: 'wrongpass' } });
		const result = await unlinkGoogle(event);

		expect(result).toMatchObject({
			status: 400,
			data: { action: 'unlinkGoogle', error: 'Kata sandi saat ini salah.' }
		});
	});

	it('returns success when usecase succeeds', async () => {
		mockUnlinkExec.mockResolvedValueOnce(undefined);
		const event = createEvent({ formData: { current_password: 'correctpass' } });
		const result = await unlinkGoogle(event);

		expect(mockUnlinkExec).toHaveBeenCalledWith({ current_password: 'correctpass' });
		expect(result).toEqual({
			success: true,
			action: 'unlinkGoogle',
			message: 'Tautan akun Google berhasil diputuskan.'
		});
	});
});
