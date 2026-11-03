<script lang="ts">
	import type { Question, StrokeInput } from '$features/question/domain/entities/question.entity';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { cn } from '$lib/utils.js';
	import { InfoIcon } from 'lucide-svelte';
	import {
		hasQuestionOptionAnswerKey,
		isQuestionAnswered,
		resolveQuestionNavigatorStatus
	} from '../models/question-multiple-choice-feedback.model';

	interface Props {
		questions: Question[];
		answers: Record<string, string | StrokeInput>;
		activeIndex: number;
		maxAccessibleIndex?: number;
		disabled?: boolean;
		immediateFeedback?: boolean;
		onQuestionSelect: (index: number) => void;
	}

	let {
		questions,
		answers,
		activeIndex,
		maxAccessibleIndex = questions.length - 1,
		disabled = false,
		immediateFeedback = false,
		onQuestionSelect
	}: Props = $props();

	function answered(question: Question): boolean {
		return isQuestionAnswered(question, answers[question.id]);
	}

	let answeredCount = $derived(questions.filter(answered).length);
	let progressPercentage = $derived(
		questions.length === 0 ? 0 : Math.round((answeredCount / questions.length) * 100)
	);
	let showsCorrectnessLegend = $derived(
		immediateFeedback && questions.some(hasQuestionOptionAnswerKey)
	);
</script>

<Card.Root class="min-h-0">
	<Card.Content>
		<h2 class="text-lg font-extrabold text-card-foreground">Soal</h2>

		<div class="mt-4 flex items-center gap-4">
			<div
				class="h-2 flex-1 overflow-hidden rounded-full bg-muted"
				role="progressbar"
				aria-label="Progres soal yang sudah dijawab"
				aria-valuemin="0"
				aria-valuemax="100"
				aria-valuenow={progressPercentage}
			>
				<div
					class="h-full rounded-full bg-taupe-500 transition-[width] duration-300"
					style:width={`${progressPercentage}%`}
				></div>
			</div>
			<span class="text-right text-sm font-semibold text-muted-foreground">
				{progressPercentage}%
			</span>
		</div>

		<div class="mt-6 grid grid-cols-5 gap-4">
			{#each questions as question, index (question.id)}
				{@const status = resolveQuestionNavigatorStatus(
					question,
					answers[question.id],
					immediateFeedback
				)}
				{@const isDone = answered(question)}
				{@const active = activeIndex === index && !disabled}
				<Button
					type="button"
					variant="outline"
					data-flat
					onclick={() => onQuestionSelect(index)}
					disabled={disabled || index > maxAccessibleIndex}
					aria-label={status === 'correct'
						? `Buka soal ${index + 1}, jawaban benar`
						: status === 'incorrect'
							? `Buka soal ${index + 1}, jawaban salah`
							: isDone
								? `Buka soal ${index + 1}, sudah dijawab`
								: `Buka soal ${index + 1}, belum dijawab`}
					aria-current={active ? 'step' : undefined}
					class={cn(
						'aspect-square h-auto w-full rounded-lg border p-0 text-sm font-bold transition-colors',
						active
							? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
							: status === 'correct' || status === 'answered'
								? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900 dark:hover:text-emerald-200'
								: status === 'incorrect'
									? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900 dark:hover:text-red-200'
									: 'border-border bg-muted text-card-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary'
					)}
				>
					{index + 1}
				</Button>
			{/each}
		</div>

		<div class="mt-6 rounded-xl border border-border p-4">
			<h3 class="text-sm font-extrabold text-card-foreground">Keterangan</h3>
			<div class="mt-4 space-y-3">
				<div class="flex items-start gap-3">
					<span
						class="mt-0.5 size-5 shrink-0 rounded-md border border-primary bg-primary shadow-xs"
						aria-hidden="true"
					></span>
					<p class="text-sm text-card-foreground">Soal aktif</p>
				</div>
				{#if showsCorrectnessLegend}
					<div class="flex items-start gap-3">
						<span
							class="mt-0.5 size-5 shrink-0 rounded-md border border-emerald-300 bg-emerald-50 shadow-xs dark:border-emerald-700 dark:bg-emerald-950"
							aria-hidden="true"
						></span>
						<p class="text-sm text-card-foreground">Jawaban benar</p>
					</div>
					<div class="flex items-start gap-3">
						<span
							class="mt-0.5 size-5 shrink-0 rounded-md border border-red-300 bg-red-50 shadow-xs dark:border-red-700 dark:bg-red-950"
							aria-hidden="true"
						></span>
						<p class="text-sm text-card-foreground">Jawaban salah</p>
					</div>
				{:else}
					<div class="flex items-start gap-3">
						<span
							class="mt-0.5 size-5 shrink-0 rounded-md border border-emerald-300 bg-emerald-50 shadow-xs dark:border-emerald-700 dark:bg-emerald-950"
							aria-hidden="true"
						></span>
						<p class="text-sm text-card-foreground">Sudah dijawab</p>
					</div>
				{/if}
				<div class="flex items-start gap-3">
					<span
						class="mt-0.5 size-5 shrink-0 rounded-md border border-border bg-muted shadow-xs"
						aria-hidden="true"
					></span>
					<p class="text-sm text-card-foreground">Belum dijawab</p>
				</div>
			</div>
		</div>

		<div
			class="mt-4 flex items-start gap-3 rounded-xl bg-taupe-50 p-4 text-taupe-700 dark:bg-taupe-950 dark:text-taupe-300"
		>
			<InfoIcon class="mt-0.5 size-5 shrink-0" aria-hidden="true" />
			<div>
				{#if showsCorrectnessLegend}
					<p class="text-sm font-bold">Pelajari pembahasan pada setiap soal</p>
					<p class="mt-1 text-xs leading-relaxed text-muted-foreground">
						Kamu dapat meninjau kembali pembahasan dan pilihan jawaban sebelum mengakhiri latihan.
					</p>
				{:else}
					<p class="text-sm font-bold">Pastikan semua soal sudah dijawab</p>
					<p class="mt-1 text-xs leading-relaxed text-muted-foreground">
						Kamu dapat meninjau kembali jawaban sebelum mengakhiri tes.
					</p>
				{/if}
			</div>
		</div>
	</Card.Content>
</Card.Root>
