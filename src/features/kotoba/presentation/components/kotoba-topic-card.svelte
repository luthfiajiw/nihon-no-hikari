<script lang="ts">
	import { ArrowRightIcon, BookOpenIcon, ClipboardListIcon } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { KotobaCategory, KotobaTopic } from '../../data/kotoba-topics';

	let { topic }: { topic: KotobaTopic } = $props();

	const categoryClasses: Record<KotobaCategory, string> = {
		Dasar:
			'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
		Populer:
			'border-pink-200 bg-pink-50 text-pink-600 dark:border-pink-900 dark:bg-pink-950/40 dark:text-pink-300',
		Pemula:
			'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300'
	};
</script>

<Card.Root class="h-full justify-between">
	<Card.Content>
		<div class="mb-3.5 flex items-center justify-between gap-2">
			<span
				class="rounded-lg bg-sky-600 px-3 py-1 text-xs font-bold tracking-wide text-white shadow-xs shadow-sky-600/30"
			>
				{topic.level}
			</span>
			<Badge variant="outline" class={categoryClasses[topic.category]}>{topic.category}</Badge>
		</div>
		<h3 class="mb-2 text-xl font-semibold tracking-tight">{topic.title}</h3>
		<Card.Description class="leading-relaxed">{topic.description}</Card.Description>
	</Card.Content>
	<Card.Footer class="flex-col items-stretch gap-4 pb-7">
		<div
			class="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground"
		>
			<span class="flex items-center gap-1.5">
				<BookOpenIcon class="size-4" aria-hidden="true" />
				{topic.vocabularyCount} Kotoba
			</span>
			<span class="flex items-center gap-1.5">
				<ClipboardListIcon class="size-4" aria-hidden="true" />
				{topic.exerciseCount} Latihan
			</span>
		</div>
		<Button class="ml-auto" aria-label={`Lihat topik ${topic.title}`}>
			Lihat Topik
			<ArrowRightIcon class="size-4" aria-hidden="true" />
		</Button>
	</Card.Footer>
</Card.Root>
