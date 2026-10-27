import { describe, expect, it, vi } from 'vitest';
import { HttpError } from '$lib/http/http-error';
import { managementLoad } from './management-load';

vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));

describe('management page failures', () => {
	it.each([
		[401, '/signin'],
		[403, '/']
	] as const)('redirects access failure %s', async (status, location) => {
		await expect(
			managementLoad(() => Promise.reject(new HttpError(status, 'Akses ditolak.')))
		).rejects.toMatchObject({ status: 303, location });
	});

	it('preserves API status and message for failed page loads', async () => {
		await expect(
			managementLoad(() => Promise.reject(new HttpError(409, 'Versi berubah.')))
		).rejects.toMatchObject({ status: 409, body: { message: 'Versi berubah.' } });
	});

	it('does not turn unexpected programming errors into API failures', async () => {
		const cause = new Error('unexpected');
		await expect(managementLoad(() => Promise.reject(cause))).rejects.toBe(cause);
	});
});
