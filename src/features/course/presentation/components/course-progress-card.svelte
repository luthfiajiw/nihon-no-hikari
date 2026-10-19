<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { ArrowRightIcon, TrendingUpIcon } from 'lucide-svelte';
	import villageBg from '$lib/assets/images/village-bg.png';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<Card.Root
	class={`flex h-full w-full flex-col justify-between bg-cover bg-no-repeat ${className}`}
	style="background-image: url('{villageBg}'); background-position: center bottom 65%;"
>
	<Card.Header>
		<Card.Title class="flex items-center gap-3">
			<div class="rounded-full bg-sky-100 p-2">
				<TrendingUpIcon class="size-4 text-sky-600" />
			</div>
			Progress Belajarmu
		</Card.Title>
	</Card.Header>
	<Card.Content class="flex flex-1 flex-col justify-between">
		<div>
			<p class="text-sm text-neutral-500">Kursus saat ini:</p>
			<div class="flex items-center justify-between py-1">
				<p class="text-lg font-semibold">JLPT N5</p>
				<p class="text-xs text-neutral-500">33%</p>
			</div>
			<Progress value={33} class="mb-3 h-3" />
		</div>
		<div class="group flex justify-end pt-2">
			<Button type="button" class="border-2 transition-all duration-50">
				Lanjut Belajar <ArrowRightIcon
					class="size-4 transition-transform group-hover:translate-x-1"
				/>
			</Button>
		</div>
	</Card.Content>
</Card.Root>
