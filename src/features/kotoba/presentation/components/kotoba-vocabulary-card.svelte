<script lang="ts">
	import { SquareIcon, Volume2Icon } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import {
		kotobaTypeLabels,
		type KotobaVocabulary
	} from '../../data/kotoba-topic-detail';
	import { kotobaTypeBadgeClasses } from '../models/kotoba-vocabulary.model';
	import { cn } from '$lib/utils';

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
</script>

<Card.Root class="h-full gap-0 py-4" aria-labelledby={`word-${vocabulary.id}`}>
	<Card.Content
		class="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2 gap-y-4 px-3 sm:grid-cols-[2rem_minmax(0,1fr)] sm:gap-x-3 sm:px-4"
	>
		<span
			class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
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
						class={cn(
							'text-[11px] font-medium whitespace-nowrap',
							kotobaTypeBadgeClasses[vocabulary.type]
						)}
					>
						{kotobaTypeLabels[vocabulary.type]}
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
			<div class="rounded-xl bg-primary/5 px-3.5 py-2.5">
				<p class="text-sm leading-relaxed sm:text-base" lang="ja">{vocabulary.example.japanese}</p>
				<p class="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
					{vocabulary.example.indonesian}
				</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>
