<script lang="ts">
	import { SquareIcon, Volume2Icon } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { KotobaType, KotobaVocabulary } from '../../data/kotoba-topic-detail';

	let {
		vocabulary,
		number,
		isPlaying,
		speechAvailable,
		onPlay
	}: {
		vocabulary: KotobaVocabulary;
		number: number;
		isPlaying: boolean;
		speechAvailable: boolean;
		onPlay: () => void;
	} = $props();

	const typeClasses: Record<KotobaType, string> = {
		'Kata Benda':
			'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
		'Kata Kerja':
			'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
		'Kata Sifat':
			'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
		Lainnya:
			'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300'
	};
</script>

<Card.Root class="h-full gap-0 bg-transparent py-4" aria-labelledby={`word-${vocabulary.id}`}>
	<Card.Content
		class="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 gap-y-4 px-4 sm:grid-cols-[2rem_minmax(0,1fr)] sm:gap-x-4 sm:px-5"
	>
		<span
			class="flex size-7 items-center justify-center rounded-full bg-sky-50 text-xs font-semibold text-slate-700 sm:size-8 dark:bg-sky-950/60 dark:text-sky-200"
			aria-label={`Kosakata ${number}`}
		>
			{number}
		</span>
		<div class="flex min-w-0 flex-col gap-4">
			<div class="flex items-start justify-between gap-3">
				<div class="flex min-w-0 flex-wrap items-end gap-x-6 gap-y-2">
					<h2
						id={`word-${vocabulary.id}`}
						class="text-3xl leading-snug font-bold whitespace-nowrap sm:text-4xl"
						lang="ja"
					>
						{#each vocabulary.furigana as part, index (index)}
							{#if part.reading}
								<ruby>
									{part.text}
									<rp>(</rp>
									<rt class="mb-1 text-xs font-medium tracking-widest sm:text-sm">
										{part.reading}
									</rt>
									<rp>)</rp>
								</ruby>
							{:else}
								{part.text}
							{/if}
						{/each}
					</h2>
					<div class="min-w-0 pb-0.5">
						<p class="text-sm text-muted-foreground">{vocabulary.romaji}</p>
						<p class="mt-0.5 text-base font-semibold text-primary sm:text-lg">
							{vocabulary.translation}
						</p>
					</div>
				</div>
				<div
					class="flex shrink-0 flex-col-reverse items-end gap-2 sm:flex-row sm:items-center sm:gap-4"
				>
					<Badge
						variant="outline"
						class={`text-[11px] font-medium whitespace-nowrap ${typeClasses[vocabulary.type]}`}
					>
						{vocabulary.type}
					</Badge>
					<Button
						size="icon"
						class="size-10"
						disabled={!speechAvailable}
						aria-label={`${isPlaying ? 'Hentikan' : 'Dengarkan'} pelafalan ${vocabulary.romaji}`}
						aria-pressed={isPlaying}
						onclick={onPlay}
					>
						{#if isPlaying}
							<SquareIcon class="size-4 fill-current" aria-hidden="true" />
						{:else}
							<Volume2Icon class="size-4" aria-hidden="true" />
						{/if}
					</Button>
				</div>
			</div>
			<div class="rounded-xl bg-sky-50/80 px-3.5 py-2.5 dark:bg-sky-950/30">
				<p class="text-sm leading-relaxed sm:text-base" lang="ja">{vocabulary.example.japanese}</p>
				<p class="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
					{vocabulary.example.indonesian}
				</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>
