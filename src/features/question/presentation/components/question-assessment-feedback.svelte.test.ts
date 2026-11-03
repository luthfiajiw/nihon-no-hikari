import { describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Fixture from './question-assessment-feedback.test-fixture.svelte';
import type { Question } from '$features/question/domain/entities/question.entity';
import '../../../../routes/layout.css';

describe('Assessment Question Feedback & Navigator Components', () => {
	const practiceQuestion: Question = {
		id: 'q-reading-1',
		question_type: 'multiple_choice',
		skill: 'reading',
		prompt_text: 'Bagaimana cara membaca karakter ini?',
		stimulus_text: 'あ',
		explanation: 'あ dibaca "a" dalam sistem hiragana.',
		points: 1,
		order_index: 0,
		options: [
			{ id: 'opt-correct', label: 'a', order_index: 0, is_correct: true },
			{ id: 'opt-wrong', label: 'i', order_index: 1, is_correct: false },
			{ id: 'opt-neutral', label: 'u', order_index: 2, is_correct: false }
		]
	};

	const noExplanationQuestion: Question = {
		id: 'q-reading-2',
		question_type: 'multiple_choice',
		skill: 'reading',
		prompt_text: 'Bagaimana cara membaca karakter ini?',
		stimulus_text: 'い',
		explanation: '   ',
		points: 1,
		order_index: 0,
		options: [
			{ id: 'opt-correct-2', label: 'i', order_index: 0, is_correct: true },
			{ id: 'opt-wrong-2', label: 'u', order_index: 1, is_correct: false }
		]
	};

	const examQuestion: Question = {
		id: 'q-exam-1',
		question_type: 'multiple_choice',
		skill: 'reading',
		prompt_text: 'Ujian membaca',
		stimulus_text: 'あ',
		points: 1,
		order_index: 0,
		options: [
			{ id: 'opt-1', label: 'a', order_index: 0 },
			{ id: 'opt-2', label: 'i', order_index: 1 }
		]
	};

	it('immediately highlights emerald for correct option, red for incorrect selection, locks options, and displays explanation in Practice mode', async () => {
		const target = document.createElement('div');
		document.body.append(target);

		const component = mount(Fixture, {
			target,
			props: {
				question: practiceQuestion,
				immediateFeedback: true
			}
		});

		try {
			// Initially no explanation card is shown
			expect(target.querySelector('[data-slot="question-explanation"]')).toBeNull();

			const buttons = target.querySelectorAll<HTMLButtonElement>('button[aria-pressed]');
			expect(buttons).toHaveLength(3);
			for (const btn of buttons) {
				expect(btn.disabled).toBe(false);
			}

			// Click option 2 (incorrect)
			buttons[1].click();
			flushSync();

			// Correct option (index 0) turns emerald
			expect(buttons[0].className).toContain('border-emerald-500');
			expect(buttons[0].className).toContain('bg-emerald-50');

			// Selected wrong option (index 1) turns red
			expect(buttons[1].className).toContain('border-red-500');
			expect(buttons[1].className).toContain('bg-red-50');

			// Other wrong option (index 2) is neutral locked
			expect(buttons[2].className).toContain('text-muted-foreground');

			// All option buttons are locked
			for (const btn of buttons) {
				expect(btn.disabled).toBe(true);
			}

			// Explanation block is rendered with text
			const explanationBlock = target.querySelector<HTMLDivElement>(
				'[data-slot="question-explanation"]'
			);
			expect(explanationBlock).not.toBeNull();
			expect(explanationBlock?.textContent).toContain('Penjelasan');
			expect(explanationBlock?.textContent).toContain('あ dibaca "a" dalam sistem hiragana.');

			// Navigator button reflects incorrect status
			const navButtons = target.querySelectorAll<HTMLButtonElement>(
				'button[aria-label*="Buka soal 1"]'
			);
			expect(navButtons.length).toBeGreaterThan(0);
			const navBtn = navButtons[0];
			expect(navBtn.className).toContain('border-red-300');
			expect(navBtn.className).toContain('bg-red-50');
			expect(navBtn.getAttribute('aria-label')).toContain('jawaban salah');

			// Legend shows Jawaban salah and Jawaban benar
			expect(target.textContent).toContain('Jawaban benar');
			expect(target.textContent).toContain('Jawaban salah');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('highlights emerald when correct option is selected and navigator button is emerald in Practice mode', async () => {
		const target = document.createElement('div');
		document.body.append(target);

		const component = mount(Fixture, {
			target,
			props: {
				question: practiceQuestion,
				immediateFeedback: true
			}
		});

		try {
			const buttons = target.querySelectorAll<HTMLButtonElement>('button[aria-pressed]');
			// Click correct option (index 0)
			buttons[0].click();
			flushSync();

			expect(buttons[0].className).toContain('border-emerald-500');
			expect(buttons[0].className).toContain('bg-emerald-50');
			expect(buttons[1].className).toContain('text-muted-foreground');
			expect(buttons[2].className).toContain('text-muted-foreground');

			for (const btn of buttons) {
				expect(btn.disabled).toBe(true);
			}

			const navBtn = target.querySelector<HTMLButtonElement>('button[aria-label*="Buka soal 1"]');
			expect(navBtn?.className).toContain('border-emerald-300');
			expect(navBtn?.className).toContain('bg-emerald-50');
			expect(navBtn?.getAttribute('aria-label')).toContain('jawaban benar');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('locks and reveals highlights without rendering empty explanation card when explanation is blank', async () => {
		const target = document.createElement('div');
		document.body.append(target);

		const component = mount(Fixture, {
			target,
			props: {
				question: noExplanationQuestion,
				immediateFeedback: true
			}
		});

		try {
			const buttons = target.querySelectorAll<HTMLButtonElement>('button[aria-pressed]');
			buttons[0].click();
			flushSync();

			expect(buttons[0].disabled).toBe(true);
			expect(buttons[0].className).toContain('border-emerald-500');
			expect(target.querySelector('[data-slot="question-explanation"]')).toBeNull();
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('keeps standard selection without locking or explanation in Final Exam mode', async () => {
		const target = document.createElement('div');
		document.body.append(target);

		const component = mount(Fixture, {
			target,
			props: {
				question: examQuestion,
				immediateFeedback: false
			}
		});

		try {
			const buttons = target.querySelectorAll<HTMLButtonElement>('button[aria-pressed]');
			buttons[0].click();
			flushSync();

			// Selected button uses primary styling
			expect(buttons[0].className).toContain('border-primary');
			expect(buttons[0].disabled).toBe(false);

			// Can switch to option 2 freely
			buttons[1].click();
			flushSync();
			expect(buttons[1].className).toContain('border-primary');
			expect(buttons[1].disabled).toBe(false);

			// No explanation card
			expect(target.querySelector('[data-slot="question-explanation"]')).toBeNull();

			// Legend shows standard Sudah dijawab, not right/wrong
			expect(target.textContent).toContain('Sudah dijawab');
			expect(target.textContent).not.toContain('Jawaban salah');

			// Navigator button uses standard answered style
			const navBtn = target.querySelector<HTMLButtonElement>('button[aria-label*="Buka soal 1"]');
			expect(navBtn?.getAttribute('aria-label')).toContain('sudah dijawab');
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
