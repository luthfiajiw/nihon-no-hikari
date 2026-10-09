<script lang="ts">
	import type { Question } from '$features/question/domain/entities/question.entity';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { cn } from '$lib/utils.js';
	import { InfoIcon } from 'lucide-svelte';

	interface Props {
		questions: Question[];
		answers: Record<string, string>;
		activeIndex: number;
		disabled?: boolean;
		onQuestionSelect: (index: number) => void;
	}

	let { questions, answers, activeIndex, disabled = false, onQuestionSelect }: Props = $props();
	let answeredCount = $derived(
		questions.filter((question) => Boolean(answers[question.id]?.trim())).length
	);
	let progressPercentage = $derived(
		questions.length === 0 ? 0 : Math.round((answeredCount / questions.length) * 100)
	);
</script>

<Card.Root class="min-h-0 overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
	<Card.Content>
		<h2 class="text-lg font-extrabold text-slate-900">Soal</h2>

		<div class="mt-4 flex items-center gap-4">
			<div
				class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"
				role="progressbar"
				aria-label="Progres soal yang sudah dijawab"
				aria-valuemin="0"
				aria-valuemax="100"
				aria-valuenow={progressPercentage}
			>
				<div
					class="h-full rounded-full bg-sky-600 transition-[width] duration-300"
					style:width={`${progressPercentage}%`}
				></div>
			</div>
			<span class="text-right text-sm font-semibold text-slate-500">
				{progressPercentage}%
			</span>
		</div>

		<div class="mt-6 grid grid-cols-5 gap-4">
			{#each questions as question, index (question.id)}
				{@const answered = Boolean(answers[question.id]?.trim())}
				{@const active = activeIndex === index && !disabled}
				<Button
					type="button"
					variant="outline"
					onclick={() => onQuestionSelect(index)}
					{disabled}
					aria-label={`Buka soal ${index + 1}${answered ? ', sudah dijawab' : ', belum dijawab'}`}
					aria-current={active ? 'step' : undefined}
					class={cn(
						'aspect-square h-auto w-full rounded-lg border p-0 text-sm font-bold shadow-xs transition-colors',
						active
							? 'border-sky-600 bg-sky-600 text-white hover:bg-sky-700 hover:text-white'
							: answered
								? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800'
								: 'border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700'
					)}
				>
					{index + 1}
				</Button>
			{/each}
		</div>

		<div class="mt-6 rounded-xl border border-slate-200 p-4">
			<h3 class="text-sm font-extrabold text-slate-900">Keterangan</h3>
			<div class="mt-4 space-y-3">
				<div class="flex items-start gap-3">
					<span
						class="mt-0.5 size-5 shrink-0 rounded-md border border-sky-600 bg-sky-600 shadow-xs"
						aria-hidden="true"
					></span>
					<p class="text-sm text-slate-900">Soal aktif</p>
				</div>
				<div class="flex items-start gap-3">
					<span
						class="mt-0.5 size-5 shrink-0 rounded-md border border-emerald-300 bg-emerald-50 shadow-xs"
						aria-hidden="true"
					></span>
					<p class="text-sm text-slate-900">Sudah dijawab</p>
				</div>
				<div class="flex items-start gap-3">
					<span
						class="mt-0.5 size-5 shrink-0 rounded-md border border-slate-200 bg-slate-50 shadow-xs"
						aria-hidden="true"
					></span>
					<p class="text-sm text-slate-900">Belum dijawab</p>
				</div>
			</div>
		</div>

		<div class="mt-4 flex items-start gap-3 rounded-xl bg-sky-50 p-4 text-sky-700">
			<InfoIcon class="mt-0.5 size-5 shrink-0" aria-hidden="true" />
			<div>
				<p class="text-sm font-bold">Pastikan semua soal sudah dijawab</p>
				<p class="mt-1 text-xs leading-relaxed text-slate-600">
					Kamu dapat meninjau kembali jawaban sebelum mengakhiri tes.
				</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>
