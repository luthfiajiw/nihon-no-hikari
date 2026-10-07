import { command } from '$app/server';
import { z } from 'zod';
import { startQuestionSetAttemptUseCase } from '../../../../dependencies/question.dependency';

const startQuestionSetAttemptSchema = z.object({
	courseId: z.string().min(1),
	lessonId: z.string().min(1),
	questionSetId: z.string().min(1)
});

export const startQuestionSetAttempt = command(startQuestionSetAttemptSchema, async (payload) => {
	try {
		return await startQuestionSetAttemptUseCase.exec(
			payload.courseId,
			payload.lessonId,
			payload.questionSetId
		);
	} catch (error) {
		return {
			success: false as const,
			message: error instanceof Error ? error.message : 'Gagal memulai pengerjaan soal.'
		};
	}
});
