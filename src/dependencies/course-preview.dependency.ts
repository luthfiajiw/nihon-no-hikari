import { requestFetch } from '#request-fetch';
import { resolve } from '$app/paths';
import { CourseLessonPreviewSource } from '$features/course/data/sources/course-lesson-preview.source';

const source = new CourseLessonPreviewSource(requestFetch, resolve('/api/admin/lesson-preview'));
export const previewCourseLessonContent = source.preview.bind(source);
