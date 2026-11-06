import { fail, type RequestEvent } from '@sveltejs/kit';
import { setAuthState } from '$lib/server/auth-cookie';
import { HttpError } from '$lib/http/http-error';
import {
	updateUserProfileUseCase,
	changeUserPasswordUseCase,
	revokeOtherSessionsUseCase
} from '$dependencies/user.dependency';
import {
	updateProfileSchema,
	changePasswordSchema
} from '../../domain/schemas/user-profile-request.schema';

export async function updateProfile(event: RequestEvent) {
	if (!event.locals.user || !event.locals.session) {
		return fail(401, { error: 'Silakan masuk terlebih dahulu.' });
	}

	try {
		const form = await event.request.formData();
		const rawName = String(form.get('display_name') ?? '');
		const rawAvatar = form.get('avatar_url');
		const avatarUrl = typeof rawAvatar === 'string' && rawAvatar.trim() ? rawAvatar.trim() : null;

		const validation = updateProfileSchema.safeParse({
			display_name: rawName,
			avatar_url: avatarUrl
		});

		if (!validation.success) {
			const firstError = validation.error.issues[0]?.message ?? 'Data profil tidak valid.';
			return fail(400, { error: firstError });
		}

		const updatedUser = await updateUserProfileUseCase.exec(validation.data);

		// Synchronize frontend auth cookie immediately
		setAuthState(event.cookies, {
			user: updatedUser,
			session: event.locals.session
		});
		event.locals.user = updatedUser;

		return {
			success: true,
			message: 'Profil berhasil diperbarui.',
			user: updatedUser
		};
	} catch (cause) {
		const message = cause instanceof HttpError ? cause.message : 'Gagal memperbarui profil.';
		return fail(cause instanceof HttpError ? cause.status : 500, { error: message });
	}
}

export async function changePassword(event: RequestEvent) {
	if (!event.locals.user) {
		return fail(401, { error: 'Silakan masuk terlebih dahulu.' });
	}

	try {
		const form = await event.request.formData();
		const currentPassword = String(form.get('current_password') ?? '');
		const newPassword = String(form.get('new_password') ?? '');
		const confirmPassword = String(form.get('confirm_password') ?? '');

		const validation = changePasswordSchema.safeParse({
			current_password: currentPassword || undefined,
			new_password: newPassword,
			confirm_password: confirmPassword
		});

		if (!validation.success) {
			const firstError = validation.error.issues[0]?.message ?? 'Data kata sandi tidak valid.';
			return fail(400, { error: firstError });
		}

		await changeUserPasswordUseCase.exec({
			current_password: validation.data.current_password,
			new_password: validation.data.new_password,
			confirm_password: validation.data.confirm_password
		});

		return {
			success: true,
			message: 'Kata sandi berhasil diperbarui.'
		};
	} catch (cause) {
		const message = cause instanceof HttpError ? cause.message : 'Gagal mengubah kata sandi.';
		return fail(cause instanceof HttpError ? cause.status : 400, { error: message });
	}
}

export async function revokeSessions(event: RequestEvent) {
	if (!event.locals.user) {
		return fail(401, { error: 'Silakan masuk terlebih dahulu.' });
	}

	try {
		await revokeOtherSessionsUseCase.exec();
		return {
			success: true,
			message: 'Seluruh sesi lain berhasil dicabut.'
		};
	} catch (cause) {
		const message = cause instanceof HttpError ? cause.message : 'Gagal mencabut sesi lain.';
		return fail(cause instanceof HttpError ? cause.status : 500, { error: message });
	}
}
