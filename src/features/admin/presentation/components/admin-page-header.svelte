<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		title,
		description,
		children,
		actions
	}: {
		title: string;
		description?: string;
		children?: Snippet;
		actions?: Snippet;
	} = $props();
</script>

<header class="flex flex-wrap items-center justify-between">
	<div class="flex min-w-0 items-center gap-2">
		<div class="min-w-0 space-y-1">
			<h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
			{#if description}
				<p class="text-sm text-slate-500">{description}</p>
			{/if}
			{@render children?.()}
		</div>
	</div>
	{#if actions}
		<div class="flex flex-wrap items-center gap-2">{@render actions()}</div>
	{/if}
</header>
