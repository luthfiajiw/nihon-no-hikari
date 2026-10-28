<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { SparklesIcon } from 'lucide-svelte';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<Card.Root size="sm" class={className}>
	<Card.Content>
		<div class="flex items-center gap-3 px-2 pb-3">
			<SparklesIcon class="size-5 text-taupe-500 dark:text-taupe-400" />
			<div>
				<p class="text-sm font-bold text-taupe-900 dark:text-taupe-100">
					Ingat, konsistensi adalah kunci!
				</p>
				<p class="text-xs text-taupe-500 dark:text-taupe-400">
					Sedikit demi sedikit, kemampuan bahasa Jepang kamu akan terus berkembang.
				</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>
