import { AdminError, type AdminLessonContent } from '../../domain/entities/admin.entity';

// The browser uses the authenticated same-origin adapter, never private API credentials.
export class LessonPreviewSource {
	constructor(
		private readonly fetcher: typeof fetch,
		private readonly endpoint: string
	) {}
	async preview(content: AdminLessonContent): Promise<AdminLessonContent> {
		const response = await this.fetcher(this.endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content })
		});
		const data = (await response.json().catch(() => ({}))) as {
			data: AdminLessonContent;
			error?: string;
		};
		if (!response.ok) throw new AdminError(response.status, data.error ?? 'Preview gagal.');
		return data.data;
	}
}
