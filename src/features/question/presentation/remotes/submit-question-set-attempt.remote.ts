import { command } from '$app/server';
import { z } from 'zod';
import { submitQuestionSetAttemptUseCase } from '../../../../dependencies/question.dependency';

const submitQuestionSetAttemptSchema = z.object({
	courseId: z.string().min(1),
	lessonId: z.string().min(1),
	questionSetId: z.string().min(1),
	attemptId: z.string().min(1),
	request: z.object({
		answers: z.array(
			z.object({
				question_id: z.string().min(1),
				selected_option_id: z.string().min(1).nullable(),
				stroke_input: z.unknown()
			})
		)
	})
});

export const submitQuestionSetAttempt = command(submitQuestionSetAttemptSchema, async (payload) => {
	try {
		console.log(payload.request.answers[0])
		return await submitQuestionSetAttemptUseCase.exec(
			payload.courseId,
			payload.lessonId,
			payload.questionSetId,
			payload.attemptId,
			payload.request
		);
	} catch (error) {
		return {
			success: false as const,
			message: error instanceof Error ? error.message : 'Gagal mengirim jawaban.'
		};
	}
});
