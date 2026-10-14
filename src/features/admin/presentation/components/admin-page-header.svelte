<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { BookOpen } from 'lucide-svelte';
	let {
		title,
		description,
		icon: Icon,
		tone = 'blue',
		children,
		actions
	}: {
		title: string;
		description?: string;
		icon: typeof BookOpen;
		tone?: 'blue' | 'violet';
		children?: Snippet;
		actions?: Snippet;
	} = $props();
</script>

<header class="flex flex-wrap items-center justify-between gap-4">
	<div class="flex min-w-0 items-center gap-4">
		<div
			class="flex size-14 shrink-0 items-center justify-center rounded-2xl border {tone === 'violet'
				? 'border-violet-100 bg-violet-50 text-violet-600'
				: 'border-blue-100 bg-blue-50 text-blue-600'}"
		>
			<Icon class="size-7" />
		</div>
		<div class="min-w-0 space-y-2">
			<h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
			{#if description}<p class="text-sm text-slate-500">{description}</p>{/if}
			{@render children?.()}
		</div>
	</div>
	{#if actions}<div class="flex flex-wrap items-center gap-2">{@render actions()}</div>{/if}
</header>
