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
	import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from 'lucide-svelte';
	import WritingCanvas from './writing-canvas.svelte';

	interface Props {
		question: Question;
		questionNumber: number;
		totalQuestions: number;
		answer?: string;
		strokeAnswer?: StrokeInput;
		disabled?: boolean;
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
</script>

<Card.Root class="min-h-0 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
	<Card.Content>
		<div class="flex items-center gap-3">
			<Badge class="bg-sky-50 text-sky-700">{skillLabels[question.skill]}</Badge>
			<span class="text-sm text-slate-500">Soal {questionNumber} dari {totalQuestions}</span>
		</div>

		<h2 class="mt-5 text-xl font-extrabold text-slate-900 sm:text-2xl">
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
				class="mx-auto my-5 flex min-h-28 items-center justify-center rounded-xl bg-slate-50 px-6 py-4 text-center text-5xl sm:text-7xl"
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
					{@const selected = answer === option.id}
					<Button
						type="button"
						variant="outline"
						onclick={() => onAnswerChange(option.id)}
						{disabled}
						aria-pressed={selected}
						class={cn(
							'min-h-16 w-full justify-start gap-4 rounded-xl px-4 py-3 text-left whitespace-normal shadow-none transition-colors',
							selected
								? 'border-primary bg-primary/10 text-slate-900 hover:border-primary hover:bg-primary/20 hover:text-slate-900'
								: 'border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/10 hover:text-slate-900'
						)}
					>
						<span
							class={cn(
								'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
								selected ? 'border-primary bg-primary' : 'border-slate-300 bg-white'
							)}
						>
							{#if selected}
								<span class="size-1.5 rounded-full bg-white"></span>
							{/if}
						</span>

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
		{:else if question.question_type === 'multiple_choice'}
			<label class="mt-6 block text-sm font-bold text-slate-900" for="written-answer">
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
				'mt-8 flex items-center gap-4 border-t border-slate-100 pt-5',
				isFirstQuestion ? 'justify-end' : 'justify-between'
			)}
		>
			{#if !isFirstQuestion}
				<Button
					type="button"
					variant="outline"
					onclick={onPrevious}
					{disabled}
					class="rounded-lg border-slate-300 px-5 text-slate-800"
				>
					<ArrowLeftIcon class="size-4" />
					Sebelumnya
				</Button>
			{/if}

			<Button
				type="button"
				onclick={onNext}
				disabled={disabled || !writingComplete}
				class="rounded-lg px-5"
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
