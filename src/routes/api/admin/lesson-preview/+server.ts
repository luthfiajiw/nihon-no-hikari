import { previewCourseAdminLesson } from '$features/course/presentation/server/course-admin-actions';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = previewCourseAdminLesson;
