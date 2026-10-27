import { HttpError } from '$lib/http/http-error';
import { type CourseAdminLessonContent } from '$features/course/domain/entities/course-admin.entity';

// The browser uses the authenticated same-origin adapter, never private API credentials.
export class CourseLessonPreviewSource {
	constructor(
		private readonly fetcher: typeof fetch,
		private readonly endpoint: string
	) {}
	async preview(content: CourseAdminLessonContent): Promise<CourseAdminLessonContent> {
		const response = await this.fetcher(this.endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content })
		});
		const data = (await response.json().catch(() => ({}))) as {
			data: CourseAdminLessonContent;
			error?: string;
		};
		if (!response.ok) throw new HttpError(response.status, data.error ?? 'Preview gagal.');
		return data.data;
	}
}
