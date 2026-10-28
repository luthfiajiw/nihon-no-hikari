<script lang="ts">
	import type { Question, StrokeInput } from '$features/question/domain/entities/question.entity';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { cn } from '$lib/utils.js';
	import { InfoIcon } from 'lucide-svelte';

	interface Props {
		questions: Question[];
		answers: Record<string, string | StrokeInput>;
		activeIndex: number;
		maxAccessibleIndex?: number;
		disabled?: boolean;
		onQuestionSelect: (index: number) => void;
	}

	let {
		questions,
		answers,
		activeIndex,
		maxAccessibleIndex = questions.length - 1,
		disabled = false,
		onQuestionSelect
	}: Props = $props();
	function answered(question: Question): boolean {
		const answer = answers[question.id];
		return question.question_type === 'stroke_writing'
			? Array.isArray(answer) &&
					(question.show_writing_guide === false
						? answer.length > 0
						: Boolean(
								question.writing_guide && answer.length === question.writing_guide.strokes.length
							))
			: typeof answer === 'string' && Boolean(answer.trim());
	}
	let answeredCount = $derived(questions.filter(answered).length);
	let progressPercentage = $derived(
		questions.length === 0 ? 0 : Math.round((answeredCount / questions.length) * 100)
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
				{@const isDone = answered(question)}
				{@const active = activeIndex === index && !disabled}
				<Button
					type="button"
					variant="outline"
					data-flat
					onclick={() => onQuestionSelect(index)}
					disabled={disabled || index > maxAccessibleIndex}
					aria-label={`Buka soal ${index + 1}${isDone ? ', sudah dijawab' : ', belum dijawab'}`}
					aria-current={active ? 'step' : undefined}
					class={cn(
						'aspect-square h-auto w-full rounded-lg border p-0 text-sm font-bold transition-colors',
						active
							? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
							: isDone
								? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900 dark:hover:text-emerald-200'
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
				<div class="flex items-start gap-3">
					<span
						class="mt-0.5 size-5 shrink-0 rounded-md border border-emerald-300 bg-emerald-50 shadow-xs"
						aria-hidden="true"
					></span>
					<p class="text-sm text-card-foreground">Sudah dijawab</p>
				</div>
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
				<p class="text-sm font-bold">Pastikan semua soal sudah dijawab</p>
				<p class="mt-1 text-xs leading-relaxed text-muted-foreground">
					Kamu dapat meninjau kembali jawaban sebelum mengakhiri tes.
				</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>
