import { resolve } from '$app/paths';
import { HttpClient } from '$lib/http-client';
import { LessonPreviewSource } from '$features/admin/data/sources/lesson-preview.source';

const source = new LessonPreviewSource(
	new HttpClient({ baseUrl: '' }),
	resolve('/api/admin/lesson-preview')
);
export const previewLessonContent = source.preview.bind(source);
