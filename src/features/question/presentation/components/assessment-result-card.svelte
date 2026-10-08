<script lang="ts">
	import type { AttemptResult } from '$features/question/domain/entities/question.entity';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { cn } from '$lib/utils.js';
	import { ArrowLeftIcon, CircleAlertIcon, TrophyIcon } from 'lucide-svelte';

	interface Props {
		result: AttemptResult;
		assessmentLabel: string;
		backHref: string;
	}

	let { result, assessmentLabel, backHref }: Props = $props();
	let correctAnswerCount = $derived(result.answers.filter((answer) => answer.is_correct).length);
</script>

<Card.Root class="min-h-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
	<div class="flex flex-col items-center justify-center py-4 text-center">
		<div
			class={cn(
				'flex size-16 items-center justify-center rounded-full',
				result.is_passed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
			)}
		>
			{#if result.is_passed}
				<TrophyIcon class="size-9" />
			{:else}
				<CircleAlertIcon class="size-9" />
			{/if}
		</div>
		<Badge
			class={cn(
				'mt-5',
				result.is_passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
			)}
		>
			{result.is_passed ? 'Lulus' : 'Belum lulus'}
		</Badge>
		<p class="mt-3 text-sm font-bold tracking-widest text-sky-600 uppercase">
			Hasil {assessmentLabel}
		</p>
		<h2 class="mt-1 text-4xl font-extrabold text-slate-900">Nilai {result.score}</h2>
		<p class="mt-2 text-sm text-slate-500">
			{correctAnswerCount} dari {result.answers.length} jawaban benar
		</p>

		<div class="mt-6 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
			<div class="rounded-xl bg-slate-50 p-4">
				<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Poin</p>
				<p class="mt-1 text-lg font-extrabold text-slate-900">
					{result.earned_points}/{result.total_points}
				</p>
			</div>
			<div class="rounded-xl bg-slate-50 p-4">
				<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Nilai lulus</p>
				<p class="mt-1 text-lg font-extrabold text-slate-900">{result.passing_score}</p>
			</div>
			<div class="rounded-xl bg-slate-50 p-4">
				<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Status</p>
				<p
					class={cn(
						'mt-1 text-lg font-extrabold',
						result.is_passed ? 'text-emerald-600' : 'text-amber-600'
					)}
				>
					{result.is_passed ? 'Lulus' : 'Belum lulus'}
				</p>
			</div>
		</div>

		<Button href={backHref} class="mt-6 bg-sky-600 text-white">
			<ArrowLeftIcon class="size-4" /> Kembali ke materi
		</Button>
	</div>
</Card.Root>
