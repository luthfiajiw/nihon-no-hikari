<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { SparklesIcon } from 'lucide-svelte';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<Card.Root
	class={`border-sky-100 bg-gradient-to-r from-sky-50/80 via-blue-50/40 to-indigo-50/60 pt-4 pb-6 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800/60 ${className}`}
>
	<Card.Content class="flex flex-col items-center justify-between gap-4 sm:flex-row">
		<div class="flex items-center gap-3">
			<div
				class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-2xs dark:bg-slate-800 dark:text-sky-400"
			>
				<SparklesIcon class="size-5" />
			</div>
			<div>
				<h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">
					Ingat, konsistensi adalah kunci!
				</h4>
				<p class="text-xs text-slate-500 dark:text-slate-400">
					Sedikit demi sedikit, kemampuan bahasa Jepang kamu akan terus berkembang.
				</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>
