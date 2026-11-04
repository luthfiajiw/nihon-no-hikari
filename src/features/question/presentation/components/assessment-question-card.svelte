<script lang="ts">
	import type {
		Question,
		QuestionSkill,
		StrokeInput
	} from '$features/question/domain/entities/question.entity';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils.js';
	import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, LightbulbIcon, XIcon } from 'lucide-svelte';
	import WritingCanvas from './writing-canvas.svelte';
	import {
		isMultipleChoiceAnswerLocked,
		normalizeQuestionExplanation,
		resolveMultipleChoiceOptionState,
		type QuestionOptionVisualState
	} from '../models/question-multiple-choice-feedback.model';

	interface Props {
		question: Question;
		questionNumber: number;
		totalQuestions: number;
		answer?: string;
		strokeAnswer?: StrokeInput;
		disabled?: boolean;
		immediateFeedback?: boolean;
		onAnswerChange: (value: string) => void;
		onStrokeChange: (value: StrokeInput) => void;
		onPrevious: () => void;
		onNext: () => void;
	}

	let {
		question,
		questionNumber,
		totalQuestions,
		answer = '',
		strokeAnswer = [],
		disabled = false,
		immediateFeedback = false,
		onAnswerChange,
		onStrokeChange,
		onPrevious,
		onNext
	}: Props = $props();

	const skillLabels: Record<QuestionSkill, string> = {
		reading: 'Reading',
		writing: 'Writing',
		listening: 'Listening',
		speaking: 'Speaking'
	};

	let options = $derived(
		[...(question.options ?? [])].sort((a, b) => a.order_index - b.order_index)
	);
	let isFirstQuestion = $derived(questionNumber === 1);
	let isLastQuestion = $derived(questionNumber === totalQuestions);
	let writingComplete = $derived(
		question.question_type !== 'stroke_writing' ||
			(question.show_writing_guide === false
				? strokeAnswer.length > 0
				: Boolean(
						question.writing_guide && strokeAnswer.length === question.writing_guide.strokes.length
					))
	);

	let revealFeedback = $derived(isMultipleChoiceAnswerLocked(question, answer, immediateFeedback));
	let explanationText = $derived(normalizeQuestionExplanation(question.explanation));

	function getOptionClasses(state: QuestionOptionVisualState): string {
		switch (state) {
			case 'correct':
				return 'border-emerald-500 bg-emerald-50 text-emerald-950 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-950 disabled:opacity-100 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-100';
			case 'incorrect-selected':
				return 'border-red-500 bg-red-50 text-red-950 hover:border-red-500 hover:bg-red-50 hover:text-red-950 disabled:opacity-100 dark:border-red-500 dark:bg-red-950/50 dark:text-red-100';
			case 'neutral-locked':
				return 'border-border bg-card text-muted-foreground disabled:opacity-60';
			case 'selected':
				return 'border-primary bg-primary/10 text-card-foreground hover:border-primary hover:bg-primary/20 hover:text-card-foreground';
			case 'unselected':
				return 'border-border bg-card text-card-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-card-foreground';
		}
	}
</script>

<Card.Root class="min-h-0">
	<Card.Content>
		<div class="flex items-center gap-3">
			<Badge class="bg-taupe-50 text-taupe-700">{skillLabels[question.skill]}</Badge>
			<span class="text-sm text-muted-foreground">Soal {questionNumber} dari {totalQuestions}</span>
		</div>

		<h2 class="mt-5 text-xl font-extrabold text-card-foreground sm:text-2xl">
			{question.prompt_text}
		</h2>

		{#if question.stimulus_media_url}
			<img
				src={question.stimulus_media_url}
				alt={question.stimulus_text || question.prompt_text}
				class="mx-auto my-5 max-h-64 max-w-full rounded-xl object-contain"
			/>
		{/if}

		{#if question.stimulus_text}
			<div
				class="mx-auto my-5 flex min-h-28 items-center justify-center rounded-xl bg-muted px-6 py-4 text-center text-5xl sm:text-7xl"
			>
				{question.stimulus_text}
			</div>
		{/if}

		{#if question.question_type === 'stroke_writing' && question.writing_guide}
			<WritingCanvas
				guide={question.writing_guide}
				showGuide={question.show_writing_guide !== false}
				value={strokeAnswer}
				{disabled}
				onChange={onStrokeChange}
			/>
		{:else if question.question_type === 'multiple_choice' && options.length}
			<div class="mt-6 grid gap-3">
				{#each options as option (option.id)}
					{@const optionState = resolveMultipleChoiceOptionState(option, answer, revealFeedback)}
					{@const selected = answer === option.id}
					<Button
						type="button"
						variant="outline"
						data-flat
						onclick={() => onAnswerChange(option.id)}
						disabled={disabled || revealFeedback}
						aria-pressed={selected}
						class={cn(
							'h-auto min-h-16 w-full justify-start gap-4 px-4 py-3 text-left whitespace-normal transition-colors',
							getOptionClasses(optionState)
						)}
					>
						{#if optionState === 'correct'}
							<span
								class="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-emerald-600 bg-emerald-600 text-white"
							>
								<CheckIcon class="size-3 stroke-[3]" />
							</span>
						{:else if optionState === 'incorrect-selected'}
							<span
								class="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-red-600 bg-red-600 text-white"
							>
								<XIcon class="size-3 stroke-[3]" />
							</span>
						{:else}
							<span
								class={cn(
									'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
									selected ? 'border-primary bg-primary' : 'border-taupe-300 bg-card'
								)}
							>
								{#if selected}
									<span class="size-1.5 rounded-full bg-primary-foreground"></span>
								{/if}
							</span>
						{/if}

						{#if option.media_url}
							<img
								src={option.media_url}
								alt={option.label}
								class="size-12 rounded-lg object-contain"
							/>
						{/if}

						<span class="font-semibold">{option.label}</span>
					</Button>
				{/each}
			</div>

			{#if revealFeedback}
				{#if explanationText}
					<div
						data-slot="question-explanation"
						role="status"
						aria-live="polite"
						class="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-2 text-emerald-950 sm:p-5 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-100"
					>
						<div class="flex items-start gap-3">
							<div
								class="flex shrink-0 items-center justify-center rounded-full bg-emerald-500/15 p-1.5 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300"
							>
								<LightbulbIcon class="size-4" aria-hidden="true" />
							</div>
							<div class="mt-1 min-w-0 flex-1">
								<h3 class="text-sm font-bold tracking-wide uppercase">Penjelasan</h3>
								<p class="mt-1 text-sm leading-relaxed whitespace-pre-line text-foreground/90">
									{explanationText}
								</p>
							</div>
						</div>
					</div>
				{:else}
					<div role="status" class="sr-only">Jawaban telah dipilih.</div>
				{/if}
			{/if}
		{:else if question.question_type === 'multiple_choice'}
			<label class="mt-6 block text-sm font-bold text-card-foreground" for="written-answer">
				Jawaban
			</label>
			<Input
				id="written-answer"
				value={answer}
				oninput={(event) => onAnswerChange(event.currentTarget.value)}
				{disabled}
				placeholder="Tulis jawaban di sini"
				class="mt-2 h-12 rounded-xl"
			/>
		{/if}

		<footer
			class={cn(
				'mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-5 pb-1',
				isFirstQuestion ? 'justify-end' : 'justify-between'
			)}
		>
			{#if !isFirstQuestion}
				<Button
					type="button"
					variant="outline"
					onclick={onPrevious}
					{disabled}
					class="min-w-0 px-2 sm:px-5"
				>
					<ArrowLeftIcon class="size-4" />
					Sebelumnya
				</Button>
			{/if}

			<Button
				type="button"
				onclick={onNext}
				disabled={disabled || !writingComplete}
				class="min-w-0 px-2 sm:px-5"
			>
				{isLastQuestion ? 'Selesai' : 'Berikutnya'}
				{#if isLastQuestion}
					<CheckIcon class="size-4" />
				{:else}
					<ArrowRightIcon class="size-4" />
				{/if}
			</Button>
		</footer>
	</Card.Content>
</Card.Root>
