import { command } from '$app/server';
import { z } from 'zod';
import { getLessonDetailUseCase } from '../../../../dependencies/course.dependency';

const getLessonDetailSchema = z.object({
	lessonId: z.string().min(1)
});

export const getLessonDetail = command(getLessonDetailSchema, async (payload) => {
	try {
		return await getLessonDetailUseCase.exec(payload.lessonId);
	} catch (error) {
		return {
			success: false as const,
			message: error instanceof Error ? error.message : 'Gagal mengambil detail materi.'
		};
	}
});
