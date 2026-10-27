import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { HttpError } from '$lib/http/http-error';
export function readManagementFormPayload(value: FormDataEntryValue | null): unknown {
	if (typeof value !== 'string') throw new HttpError(400, 'Form tidak lengkap.');
	try {
		return JSON.parse(value);
	} catch {
		throw new HttpError(400, 'Data form tidak valid.');
	}
}
export function managementActionFailure(cause: unknown) {
	if (!(cause instanceof HttpError)) throw cause;
	if (cause.status === 401) redirect(303, resolve('/signin'));
	return fail(cause.status, { message: cause.message });
}
