import { describe, expect, it } from 'vitest';
import type { Question, QuestionOption } from '../../domain/entities/question.entity';
import {
	canRevealMultipleChoiceFeedback,
	hasQuestionOptionAnswerKey,
	isMultipleChoiceAnswerLocked,
	isQuestionAnswered,
	normalizeQuestionExplanation,
	resolveMultipleChoiceOptionState,
	resolveQuestionNavigatorStatus
} from './question-multiple-choice-feedback.model';

describe('question-multiple-choice-feedback.model', () => {
	const optionCorrect: QuestionOption = {
		id: 'opt-correct',
		label: 'Pilihan Benar',
		order_index: 0,
		is_correct: true
	};

	const optionWrong: QuestionOption = {
		id: 'opt-wrong',
		label: 'Pilihan Salah',
		order_index: 1,
		is_correct: false
	};

	const optionNeutral: QuestionOption = {
		id: 'opt-neutral',
		label: 'Pilihan Lain',
		order_index: 2,
		is_correct: false
	};

	const practiceQuestion: Question = {
		id: 'q-practice-1',
		question_type: 'multiple_choice',
		skill: 'reading',
		prompt_text: 'Pilih arti',
		stimulus_text: 'あ',
		points: 1,
		order_index: 0,
		explanation: '   Penjelasan hiragana a   ',
		options: [optionCorrect, optionWrong, optionNeutral]
	};

	const examQuestion: Question = {
		id: 'q-exam-1',
		question_type: 'multiple_choice',
		skill: 'reading',
		prompt_text: 'Ujian arti',
		stimulus_text: 'あ',
		points: 1,
		order_index: 0,
		options: [
			{ id: 'opt-1', label: '1', order_index: 0 },
			{ id: 'opt-2', label: '2', order_index: 1 }
		]
	};

	const writingQuestion: Question = {
		id: 'q-writing-1',
		question_type: 'stroke_writing',
		skill: 'writing',
		prompt_text: 'Tulis a',
		stimulus_text: 'あ',
		points: 1,
		order_index: 0,
		writing_guide: {
			character: 'あ',
			romaji: 'a',
			view_box: 109,
			strokes: [
				{ path: 'M0,0', points: [{ x: 0, y: 0 }] },
				{ path: 'M1,1', points: [{ x: 1, y: 1 }] }
			]
		}
	};

	describe('hasQuestionOptionAnswerKey & canRevealMultipleChoiceFeedback', () => {
		it('detects answer keys in multiple choice practice questions', () => {
			expect(hasQuestionOptionAnswerKey(practiceQuestion)).toBe(true);
			expect(canRevealMultipleChoiceFeedback(practiceQuestion, true)).toBe(true);
			expect(canRevealMultipleChoiceFeedback(practiceQuestion, false)).toBe(false);
		});

		it('returns false for exam questions without answer keys', () => {
			expect(hasQuestionOptionAnswerKey(examQuestion)).toBe(false);
			expect(canRevealMultipleChoiceFeedback(examQuestion, true)).toBe(false);
		});

		it('returns false for writing questions', () => {
			expect(hasQuestionOptionAnswerKey(writingQuestion)).toBe(false);
			expect(canRevealMultipleChoiceFeedback(writingQuestion, true)).toBe(false);
		});
	});

	describe('isQuestionAnswered & isMultipleChoiceAnswerLocked', () => {
		it('checks multiple choice string answers', () => {
			expect(isQuestionAnswered(practiceQuestion, '')).toBe(false);
			expect(isQuestionAnswered(practiceQuestion, '   ')).toBe(false);
			expect(isQuestionAnswered(practiceQuestion, 'opt-wrong')).toBe(true);
		});

		it('checks stroke writing answers', () => {
			expect(isQuestionAnswered(writingQuestion, undefined)).toBe(false);
			expect(isQuestionAnswered(writingQuestion, [])).toBe(false);
			expect(isQuestionAnswered(writingQuestion, [[{ x: 0, y: 0 }]])).toBe(false);
			expect(isQuestionAnswered(writingQuestion, [[{ x: 0, y: 0 }], [{ x: 1, y: 1 }]])).toBe(true);
		});

		it('locks practice multiple choice questions upon valid answer', () => {
			expect(isMultipleChoiceAnswerLocked(practiceQuestion, '', true)).toBe(false);
			expect(isMultipleChoiceAnswerLocked(practiceQuestion, 'opt-wrong', true)).toBe(true);
			expect(isMultipleChoiceAnswerLocked(practiceQuestion, 'opt-wrong', false)).toBe(false);
			expect(isMultipleChoiceAnswerLocked(examQuestion, 'opt-1', true)).toBe(false);
		});
	});

	describe('resolveMultipleChoiceOptionState', () => {
		it('returns selected/unselected when feedback is not revealed', () => {
			expect(resolveMultipleChoiceOptionState(optionCorrect, 'opt-correct', false)).toBe(
				'selected'
			);
			expect(resolveMultipleChoiceOptionState(optionWrong, 'opt-correct', false)).toBe(
				'unselected'
			);
		});

		it('highlights correct option in emerald and selected wrong option in red', () => {
			// Student picked wrong option
			expect(resolveMultipleChoiceOptionState(optionCorrect, 'opt-wrong', true)).toBe('correct');
			expect(resolveMultipleChoiceOptionState(optionWrong, 'opt-wrong', true)).toBe(
				'incorrect-selected'
			);
			expect(resolveMultipleChoiceOptionState(optionNeutral, 'opt-wrong', true)).toBe(
				'neutral-locked'
			);

			// Student picked correct option
			expect(resolveMultipleChoiceOptionState(optionCorrect, 'opt-correct', true)).toBe('correct');
			expect(resolveMultipleChoiceOptionState(optionWrong, 'opt-correct', true)).toBe(
				'neutral-locked'
			);
			expect(resolveMultipleChoiceOptionState(optionNeutral, 'opt-correct', true)).toBe(
				'neutral-locked'
			);
		});
	});

	describe('resolveQuestionNavigatorStatus', () => {
		it('returns unanswered when answer is missing or empty', () => {
			expect(resolveQuestionNavigatorStatus(practiceQuestion, '', true)).toBe('unanswered');
		});

		it('returns correct or incorrect for practice MCQ with immediate feedback', () => {
			expect(resolveQuestionNavigatorStatus(practiceQuestion, 'opt-correct', true)).toBe('correct');
			expect(resolveQuestionNavigatorStatus(practiceQuestion, 'opt-wrong', true)).toBe('incorrect');
		});

		it('returns answered when immediateFeedback is false or question is not practice MCQ', () => {
			expect(resolveQuestionNavigatorStatus(practiceQuestion, 'opt-correct', false)).toBe(
				'answered'
			);
			expect(resolveQuestionNavigatorStatus(examQuestion, 'opt-1', true)).toBe('answered');
			expect(
				resolveQuestionNavigatorStatus(writingQuestion, [[{ x: 0, y: 0 }], [{ x: 1, y: 1 }]], true)
			).toBe('answered');
		});
	});

	describe('normalizeQuestionExplanation', () => {
		it('trims whitespace and returns null for empty or null', () => {
			expect(normalizeQuestionExplanation(practiceQuestion.explanation)).toBe(
				'Penjelasan hiragana a'
			);
			expect(normalizeQuestionExplanation(null)).toBeNull();
			expect(normalizeQuestionExplanation(undefined)).toBeNull();
			expect(normalizeQuestionExplanation('   ')).toBeNull();
			expect(normalizeQuestionExplanation('')).toBeNull();
		});

		it('recognizes truthy string and number variants for option correctness', () => {
			const options: QuestionOption[] = [
				{ id: 'opt-1', label: '1', order_index: 0, is_correct: 'true' as unknown as boolean },
				{ id: 'opt-2', label: '2', order_index: 1, is_correct: 'false' as unknown as boolean }
			];
			const question: Question = {
				...practiceQuestion,
				options
			};

			expect(canRevealMultipleChoiceFeedback(question, true)).toBe(true);
			expect(resolveMultipleChoiceOptionState(options[0], 'opt-2', true)).toBe('correct');
			expect(resolveMultipleChoiceOptionState(options[1], 'opt-2', true)).toBe(
				'incorrect-selected'
			);
		});
	});
});
