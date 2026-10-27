import { describe, expect, it, vi } from 'vitest';
import { HttpError } from '$lib/http/http-error';
import { managementActionFailure, readManagementFormPayload } from './management-action';

vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));

describe('management form contracts', () => {
	it.each([null, '{invalid'])('rejects an incomplete or malformed payload %s', (value) => {
		expect(() => readManagementFormPayload(value)).toThrow(
			expect.objectContaining({ status: 400 })
		);
	});

	it('preserves explicit nulls and empty arrays in form payloads', () => {
		expect(readManagementFormPayload('{"lesson_id":null,"module_prerequisites":[]}')).toEqual({
			lesson_id: null,
			module_prerequisites: []
		});
	});

	it('redirects an expired session to sign-in', () => {
		expect(() => managementActionFailure(new HttpError(401, 'Sesi berakhir.'))).toThrow(
			expect.objectContaining({ status: 303, location: '/signin' })
		);
	});

	it.each([400, 403, 409])('retains status %s and feedback on the form', (status) => {
		expect(managementActionFailure(new HttpError(status, 'Gagal menyimpan.'))).toMatchObject({
			status,
			data: { message: 'Gagal menyimpan.' }
		});
	});
});
