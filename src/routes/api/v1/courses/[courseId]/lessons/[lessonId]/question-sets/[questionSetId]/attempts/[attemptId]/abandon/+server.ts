import { json } from '@sveltejs/kit';
import { abandonQuestionSetAttemptUseCase } from '$dependencies/question.dependency';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params }) => {
	try {
		await abandonQuestionSetAttemptUseCase.exec(
			params.courseId,
			params.lessonId,
			params.questionSetId,
			params.attemptId
		);

		return new Response(null, { status: 204 });
	} catch (error) {
		return json(
			{
				error: error instanceof Error ? error.message : 'Gagal membatalkan pengerjaan soal.'
			},
			{ status: 502 }
		);
	}
};
