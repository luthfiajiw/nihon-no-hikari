import {
	KotobaError,
	type KotobaMediaRecord,
	type KotobaTopicInput,
	type KotobaTopicRecord
} from '../../domain/entities/kotoba-api.entity';
import type { KotobaRepository } from '../../domain/repositories/kotoba.repository';

export class KotobaRepositoryImpl implements KotobaRepository {
	constructor(private readonly fetcher: typeof fetch) {}
	private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
		try {
			const headers = new Headers(options.headers);
			headers.set('Accept', 'application/json');
			if (typeof options.body === 'string') headers.set('Content-Type', 'application/json');
			const response = await this.fetcher(`/api/v1/${path}`, {
				...options,
				headers,
				credentials: 'same-origin',
				cache: 'no-store'
			});
			const result = await response.json().catch(() => ({}));
			if (!response.ok)
				throw new KotobaError(
					response.status,
					result.error || 'Operasi Kotoba gagal. Silakan coba lagi.',
					result.field_errors || {}
				);
			if (!result.success) throw new KotobaError(502, 'Respons server Kotoba tidak valid.');
			return result.data as T;
		} catch (cause) {
			if (cause instanceof KotobaError) throw cause;
			throw new KotobaError(502, 'Gagal terhubung ke server. Silakan coba lagi.');
		}
	}
	list(admin: boolean) {
		return this.request<KotobaTopicRecord[]>(`${admin ? 'admin/' : ''}kotoba/topics`);
	}
	detail(id: string, admin: boolean) {
		return this.request<KotobaTopicRecord>(
			`${admin ? 'admin/' : ''}kotoba/topics/${encodeURIComponent(id)}`
		);
	}
	save(id: string | null, input: KotobaTopicInput) {
		return this.request<KotobaTopicRecord>(
			`admin/kotoba/topics${id ? `/${encodeURIComponent(id)}` : ''}`,
			{ method: id ? 'PUT' : 'POST', body: JSON.stringify(input) }
		);
	}
	async remove(id: string) {
		await this.request<void>(`admin/kotoba/topics/${encodeURIComponent(id)}`, { method: 'DELETE' });
	}
	upload(kind: 'cover' | 'audio', file: File) {
		const form = new FormData();
		form.set('kind', kind);
		// Browsers may omit MIME on otherwise valid files; the API also validates bytes.
		const mime =
			kind === 'audio' ? 'audio/mpeg' : /\.png$/i.test(file.name) ? 'image/png' : 'image/jpeg';
		form.set('file', new File([file], file.name, { type: mime }));
		return this.request<KotobaMediaRecord>('admin/kotoba/media', { method: 'POST', body: form });
	}
}
