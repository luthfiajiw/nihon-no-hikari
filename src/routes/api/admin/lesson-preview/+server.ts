import { previewAdminLesson } from '$features/admin/presentation/server/admin-actions';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = previewAdminLesson;
