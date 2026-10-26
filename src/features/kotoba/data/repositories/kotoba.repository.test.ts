import { describe, it, expect, vi } from 'vitest';
import { KotobaRepositoryImpl } from './kotoba.repository.impl';
import { KotobaError } from '../../domain/entities/kotoba-api.entity';

describe('Kotoba API transport', () => {
	it('forwards multipart bytes without overriding the browser boundary', async () => {
		const fetcher = vi.fn(async () => Response.json({ success: true, data: { id: 'media' } }));
		const repository = new KotobaRepositoryImpl(fetcher);
		await repository.upload('audio', new File(['mp3-bytes'], 'word.mp3'));
		const [path, options] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
		const form = options.body as FormData;
		expect(path).toBe('/api/v1/admin/kotoba/media');
		expect(new Headers(options.headers).has('Content-Type')).toBe(false);
		expect(form.get('kind')).toBe('audio');
		expect(await (form.get('file') as File).text()).toBe('mp3-bytes');
		expect((form.get('file') as File).type).toBe('audio/mpeg');
	});
	it('keeps backend status and field paths for the editor', async () => {
		const repository = new KotobaRepositoryImpl(async () =>
			Response.json(
				{ success: false, error: 'Versi berubah', field_errors: { version: 'stale' } },
				{ status: 409 }
			)
		);
		await expect(repository.detail('id', true)).rejects.toMatchObject({
			status: 409,
			message: 'Versi berubah',
			fieldErrors: { version: 'stale' }
		});
	});
	it('does not replace API failures with sample topics', async () => {
		const repository = new KotobaRepositoryImpl(async () => {
			throw new Error('connection lost');
		});
		await expect(repository.list(false)).rejects.toBeInstanceOf(KotobaError);
	});
});
