import { HttpClient } from '$lib/http-client';
import { AdminError, type AdminLessonContent } from '../../domain/entities/admin.entity';

// The browser uses the authenticated same-origin adapter, never private API credentials.
export class LessonPreviewSource {
	constructor(
		private readonly client: HttpClient,
		private readonly endpoint: string
	) {}
	async preview(content: AdminLessonContent): Promise<AdminLessonContent> {
		const response = await this.client.request<{ data: AdminLessonContent; error?: string }>(
			this.endpoint,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content })
			}
		);
		if (!response.ok)
			throw new AdminError(response.status, response.data.error ?? 'Preview gagal.');
		return response.data.data;
	}
}
