import { command } from '$app/server';
import { z } from 'zod';
import { updateModuleProgressUseCase } from '../../../../dependencies/course.dependency';

const updateModuleProgressSchema = z.object({
	courseId: z.string().min(1),
	moduleId: z.string().min(1),
	status: z.enum(['in_progress', 'completed'])
});

export const updateModuleProgress = command(updateModuleProgressSchema, async (payload) => {
	try {
		return await updateModuleProgressUseCase.exec(payload.courseId, payload.moduleId, {
			status: payload.status
		});
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Gagal memperbarui progres modul.'
		};
	}
});
