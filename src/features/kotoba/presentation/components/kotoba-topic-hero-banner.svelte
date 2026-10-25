<script lang="ts">
	import { PlayIcon, SquareIcon } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { KotobaTopicDetail } from '../../data/kotoba-topic-detail';
	import kanjiIcon from '$lib/assets/icons/kanji.svg';
	import bannerBg from '$lib/assets/images/kotoba-school-bg.png';

	let {
		topic,
		playingAll,
		playbackDisabled,
		onTogglePlayback
	}: {
		topic: KotobaTopicDetail;
		playingAll: boolean;
		playbackDisabled: boolean;
		onTogglePlayback: () => void;
	} = $props();
</script>

<Card.Root
	class="w-full justify-between bg-transparent"
	style={`background-image: url('${bannerBg}'); background-size: cover; background-position: center; background-repeat: no-repeat;`}
>
	<Card.Content class="flex flex-col justify-between gap-6 sm:min-h-40 sm:flex-row sm:items-end">
		<div class="flex flex-col items-start gap-4">
			<Badge class="px-3 py-3 text-sm">{topic.level}</Badge>
			<h1 class="text-2xl leading-snug font-bold tracking-tight lg:text-3xl lg:leading-tight">
				{topic.title}
			</h1>
			<p class="max-w-xl text-sm leading-relaxed text-muted-foreground">
				{topic.description}
			</p>
			<Badge variant="secondary" class="border-primary bg-white px-3 py-3 text-sm">
				<span
					aria-hidden="true"
					class="mr-1 size-4 shrink-0 bg-primary mask-contain mask-center mask-no-repeat group-data-[collapsible=icon]:mr-0"
					style:mask-image={`url(${JSON.stringify(kanjiIcon)})`}
				></span>
				{topic.vocabulary.length} Kotoba
			</Badge>
		</div>
		<Button
			class="self-start sm:self-end"
			disabled={playbackDisabled}
			aria-pressed={playingAll}
			onclick={onTogglePlayback}
		>
			{#if playingAll}
				<SquareIcon class="size-4 fill-current" aria-hidden="true" />
				Hentikan
			{:else}
				<PlayIcon class="size-4 fill-current" aria-hidden="true" />
				Putar Semua
			{/if}
		</Button>
	</Card.Content>
</Card.Root>
