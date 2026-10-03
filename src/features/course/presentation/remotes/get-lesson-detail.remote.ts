import { command } from '$app/server';
import { z } from 'zod';
import { getLessonDetailUseCase } from '../../../../dependencies/course.dependency';

const getLessonDetailSchema = z.object({
	courseId: z.string().min(1),
	lessonId: z.string().min(1)
});

export const getLessonDetail = command(getLessonDetailSchema, async (payload) => {
	try {
		return await getLessonDetailUseCase.exec(payload.courseId, payload.lessonId);
	} catch (error) {
		return {
			success: false as const,
			message: error instanceof Error ? error.message : 'Gagal mengambil detail materi.'
		};
	}
});
