import { loadCourseAdminCourses } from '$features/course/presentation/server/course-admin-loaders';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = loadCourseAdminCourses;
