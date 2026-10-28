<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { ArrowRightIcon, TrendingUpIcon } from 'lucide-svelte';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<Card.Root class={`h-full w-full justify-between ${className}`}>
	<Card.Header>
		<Card.Title class="flex items-center gap-3">
			<div class="rounded-full bg-taupe-100 p-2">
				<TrendingUpIcon class="size-4 text-taupe-500" />
			</div>
			Progress Belajarmu
		</Card.Title>
	</Card.Header>
	<Card.Content class="flex flex-1 flex-col justify-between">
		<div>
			<p class="text-sm text-muted-foreground">Kursus saat ini:</p>
			<div class="flex items-center justify-between py-1">
				<p class="text-lg font-semibold">JLPT N5</p>
				<p class="text-xs text-muted-foreground">33%</p>
			</div>
			<Progress value={33} class="mb-3 h-3" />
		</div>
		<div class="group flex justify-end pt-4 pb-1">
			<Button type="button">
				Lanjut Belajar <ArrowRightIcon
					class="group-hover:trantaupe-x-1 size-4 transition-transform"
				/>
			</Button>
		</div>
	</Card.Content>
</Card.Root>
