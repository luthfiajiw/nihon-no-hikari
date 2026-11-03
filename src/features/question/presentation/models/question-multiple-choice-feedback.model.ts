import type { Question, QuestionOption, StrokeInput } from '../../domain/entities/question.entity';

export type QuestionOptionVisualState =
	'unselected' | 'selected' | 'correct' | 'incorrect-selected' | 'neutral-locked';

export type QuestionNavigatorAnswerStatus = 'unanswered' | 'answered' | 'correct' | 'incorrect';

export function isOptionCorrect(option: QuestionOption): boolean {
	return (
		option.is_correct === true ||
		String(option.is_correct) === 'true' ||
		option.is_correct === (1 as unknown as boolean)
	);
}

export function hasQuestionOptionAnswerKey(question: Question): boolean {
	return (
		question.question_type === 'multiple_choice' &&
		(question.options ?? []).some(
			(option) =>
				typeof option.is_correct === 'boolean' ||
				option.is_correct === ('true' as unknown as boolean) ||
				option.is_correct === ('false' as unknown as boolean) ||
				typeof option.is_correct === 'number'
		)
	);
}

export function canRevealMultipleChoiceFeedback(
	question: Question,
	immediateFeedback: boolean
): boolean {
	return immediateFeedback && hasQuestionOptionAnswerKey(question);
}

export function isQuestionAnswered(
	question: Question,
	answer: string | StrokeInput | undefined
): boolean {
	if (question.question_type === 'stroke_writing') {
		if (!Array.isArray(answer)) return false;
		if (question.show_writing_guide === false) return answer.length > 0;
		return Boolean(
			question.writing_guide && answer.length === question.writing_guide.strokes.length
		);
	}
	return typeof answer === 'string' && Boolean(answer.trim());
}

export function isMultipleChoiceAnswerLocked(
	question: Question,
	answer: string | StrokeInput | undefined,
	immediateFeedback: boolean
): boolean {
	return (
		canRevealMultipleChoiceFeedback(question, immediateFeedback) &&
		isQuestionAnswered(question, answer)
	);
}

export function resolveMultipleChoiceOptionState(
	option: QuestionOption,
	selectedOptionId: string,
	revealFeedback: boolean
): QuestionOptionVisualState {
	if (!revealFeedback) {
		return selectedOptionId === option.id ? 'selected' : 'unselected';
	}

	if (isOptionCorrect(option)) {
		return 'correct';
	}

	if (selectedOptionId === option.id) {
		return 'incorrect-selected';
	}

	return 'neutral-locked';
}

export function resolveQuestionNavigatorStatus(
	question: Question,
	answer: string | StrokeInput | undefined,
	immediateFeedback: boolean
): QuestionNavigatorAnswerStatus {
	if (!isQuestionAnswered(question, answer)) {
		return 'unanswered';
	}

	if (canRevealMultipleChoiceFeedback(question, immediateFeedback)) {
		const selected = (question.options ?? []).find((option) => option.id === answer);
		return selected && isOptionCorrect(selected) ? 'correct' : 'incorrect';
	}

	return 'answered';
}

export function normalizeQuestionExplanation(explanation?: string | null): string | null {
	if (!explanation) return null;
	const trimmed = explanation.trim();
	return trimmed ? trimmed : null;
}
