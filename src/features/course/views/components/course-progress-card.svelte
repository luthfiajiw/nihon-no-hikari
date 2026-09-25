<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import { Progress } from "$lib/components/ui/progress";
	import { ChevronRightIcon, TrendingUpIcon } from "lucide-svelte";
	import villageBg from "$lib/assets/images/village-bg.png";
</script>

<Card.Root 
	class="w-full bg-cover bg-no-repeat"
	style="background-image: url('{villageBg}'); background-position: center bottom -40px;"
>
	<Card.Header>
		<Card.Title class="flex items-center gap-3">
			<div class="p-2 bg-sky-100 rounded-full">
				<TrendingUpIcon class="size-4 text-sky-600"/>
			</div>
			Progress Belajarmu
		</Card.Title>
	</Card.Header>
	<Card.Content>
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
		<div class="flex justify-end pb-5.5">
			<Button type="button" class="bg-sky-600 hover:bg-sky-700">
				Lanjut Belajar <ChevronRightIcon class="size-4 text-white" />
			</Button>
		</div>
	</Card.Content>
</Card.Root>