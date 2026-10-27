import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { HttpError } from '$lib/http/http-error';
export async function managementLoad<T>(operation: () => Promise<T>): Promise<T> {
	try {
		return await operation();
	} catch (cause) {
		if (!(cause instanceof HttpError)) throw cause;
		if (cause.status === 401) redirect(303, resolve('/signin'));
		if (cause.status === 403) redirect(303, resolve('/'));
		error(cause.status, cause.message);
	}
}
