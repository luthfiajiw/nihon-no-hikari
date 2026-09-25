<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import { Progress } from "$lib/components/ui/progress";
	import { ChevronRightIcon, TrendingUpIcon } from "lucide-svelte";
	import villageBg from "$lib/assets/images/village-bg.png";

	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();
</script>

<Card.Root 
	class={`w-full h-full flex flex-col justify-between bg-cover bg-no-repeat ${className}`}
	style="background-image: url('{villageBg}'); background-position: center bottom -50px;"
>
	<Card.Header>
		<Card.Title class="flex items-center gap-3">
			<div class="p-2 bg-sky-100 rounded-full">
				<TrendingUpIcon class="size-4 text-sky-600"/>
			</div>
			Progress Belajarmu
		</Card.Title>
	</Card.Header>
	<Card.Content class="flex flex-col justify-between flex-1">
		<div>
			<p class="text-sm text-neutral-500">
				Kursus saat ini:
			</p>
			<div class="flex items-center justify-between py-1">
				<p class="text-lg font-semibold">
					JLPT N5
				</p>
				<p class="text-xs text-neutral-500">
					33%
				</p>
			</div>
			<Progress value={33} class="h-3 mb-3" />
		</div>
		<div class="flex justify-end pt-2">
			<Button type="button" class="bg-sky-600 hover:bg-sky-700">
				Lanjut Belajar <ChevronRightIcon class="size-4 text-white" />
			</Button>
		</div>
	</Card.Content>
</Card.Root>