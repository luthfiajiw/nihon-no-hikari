import { fail, type RequestEvent } from '@sveltejs/kit';
import { setAuthState } from '$lib/server/auth-cookie';
import { HttpError } from '$lib/http/http-error';
import {
	updateUserProfileUseCase,
	changeUserPasswordUseCase,
	revokeOtherSessionsUseCase,
	requestLinkGoogleCodeUseCase,
	verifyLinkGoogleCodeUseCase,
	linkUserGoogleUseCase,
	unlinkUserGoogleUseCase
} from '$dependencies/user.dependency';
import {
	updateProfileSchema,
	changePasswordSchema,
	verifyCodeSchema,
	linkGoogleSchema,
	unlinkGoogleSchema
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

export async function requestLinkGoogleCode(event: RequestEvent) {
	if (!event.locals.user) {
		return fail(401, { error: 'Silakan masuk terlebih dahulu.' });
	}

	try {
		await requestLinkGoogleCodeUseCase.exec();
		return {
			success: true,
			action: 'requestCode',
			message: 'Kode verifikasi telah dikirim ke email Anda.'
		};
	} catch (cause) {
		const message =
			cause instanceof HttpError ? cause.message : 'Gagal mengirim kode verifikasi.';
		return fail(cause instanceof HttpError ? cause.status : 500, {
			action: 'requestCode',
			error: message
		});
	}
}

export async function verifyLinkGoogleCode(event: RequestEvent) {
	if (!event.locals.user) {
		return fail(401, { error: 'Silakan masuk terlebih dahulu.' });
	}

	try {
		const form = await event.request.formData();
		const code = String(form.get('code') ?? '');

		const validation = verifyCodeSchema.safeParse({ code });
		if (!validation.success) {
			const firstError = validation.error.issues[0]?.message ?? 'Kode verifikasi tidak valid.';
			return fail(400, { action: 'verifyCode', error: firstError });
		}

		const result = await verifyLinkGoogleCodeUseCase.exec(validation.data);
		return {
			success: true,
			action: 'verifyCode',
			verification_token: result.verification_token,
			message: 'Email berhasil diverifikasi.'
		};
	} catch (cause) {
		const message =
			cause instanceof HttpError ? cause.message : 'Gagal memverifikasi kode.';
		return fail(cause instanceof HttpError ? cause.status : 400, {
			action: 'verifyCode',
			error: message
		});
	}
}

export async function linkGoogle(event: RequestEvent) {
	if (!event.locals.user) {
		return fail(401, { error: 'Silakan masuk terlebih dahulu.' });
	}

	try {
		const form = await event.request.formData();
		const idToken = String(form.get('id_token') ?? '');
		const verificationToken = String(form.get('verification_token') ?? '');

		const validation = linkGoogleSchema.safeParse({
			id_token: idToken,
			verification_token: verificationToken
		});

		if (!validation.success) {
			const firstError = validation.error.issues[0]?.message ?? 'Data penautan tidak valid.';
			return fail(400, { action: 'linkGoogle', error: firstError });
		}

		await linkUserGoogleUseCase.exec(validation.data);
		return {
			success: true,
			action: 'linkGoogle',
			message: 'Akun Google berhasil ditautkan.'
		};
	} catch (cause) {
		const message =
			cause instanceof HttpError ? cause.message : 'Gagal menautkan akun Google.';
		return fail(cause instanceof HttpError ? cause.status : 400, {
			action: 'linkGoogle',
			error: message
		});
	}
}

export async function unlinkGoogle(event: RequestEvent) {
	if (!event.locals.user) {
		return fail(401, { error: 'Silakan masuk terlebih dahulu.' });
	}

	try {
		const form = await event.request.formData();
		const currentPassword = String(form.get('current_password') ?? '');

		const validation = unlinkGoogleSchema.safeParse({
			current_password: currentPassword
		});

		if (!validation.success) {
			const firstError =
				validation.error.issues[0]?.message ?? 'Kata sandi saat ini harus diisi.';
			return fail(400, { action: 'unlinkGoogle', error: firstError });
		}

		await unlinkUserGoogleUseCase.exec(validation.data);
		return {
			success: true,
			action: 'unlinkGoogle',
			message: 'Tautan akun Google berhasil diputuskan.'
		};
	} catch (cause) {
		const message =
			cause instanceof HttpError ? cause.message : 'Gagal memutuskan tautan akun Google.';
		return fail(cause instanceof HttpError ? cause.status : 400, {
			action: 'unlinkGoogle',
			error: message
		});
	}
}
