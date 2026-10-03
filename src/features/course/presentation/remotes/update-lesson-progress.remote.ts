import { command } from '$app/server';
import { z } from 'zod';
import { updateLessonProgressUseCase } from '../../../../dependencies/course.dependency';

const updateLessonProgressSchema = z.object({
	courseId: z.string().min(1),
	lessonId: z.string().min(1),
	status: z.enum(['unlocked', 'in_progress', 'completed'])
});

export const updateLessonProgress = command(updateLessonProgressSchema, async (payload) => {
	try {
		return await updateLessonProgressUseCase.exec(payload.courseId, payload.lessonId, {
			status: payload.status
		});
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Gagal memperbarui progres materi.'
		};
	}
});
