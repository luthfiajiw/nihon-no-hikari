<script lang="ts">
	import type { Column } from '@tanstack/svelte-table';
	import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';

	let {
		column,
		title,
		class: className
	}: {
		column: Column<any, any>;
		title: string;
		class?: string;
	} = $props();
</script>

{#if !column.getCanSort()}
	<span class={cn('text-xs font-semibold text-muted-foreground', className)}>{title}</span>
{:else}
	<Button
		variant="ghost"
		size="sm"
		class={cn('-ml-3 h-8 text-xs font-semibold hover:bg-accent/60', className)}
		onclick={column.getToggleSortingHandler()}
	>
		<span>{title}</span>
		{#if column.getIsSorted() === 'desc'}
			<ArrowDownIcon class="ml-1.5 size-3.5" />
		{:else if column.getIsSorted() === 'asc'}
			<ArrowUpIcon class="ml-1.5 size-3.5" />
		{:else}
			<ArrowUpDownIcon class="ml-1.5 size-3.5 opacity-50" />
		{/if}
	</Button>
{/if}
