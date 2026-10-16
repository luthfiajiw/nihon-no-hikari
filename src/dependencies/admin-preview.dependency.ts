import { requestFetch } from '#request-fetch';
import { resolve } from '$app/paths';
import { LessonPreviewSource } from '$features/admin/data/sources/lesson-preview.source';

const source = new LessonPreviewSource(requestFetch, resolve('/api/admin/lesson-preview'));
export const previewLessonContent = source.preview.bind(source);
