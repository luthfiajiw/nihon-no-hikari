<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { Search } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	let {
		ref = $bindable(null),
		value = $bindable(''),
		class: className,
		...restProps
	}: CommandPrimitive.InputProps = $props();
</script>

<div data-slot="command-input-wrapper" class="flex items-center gap-2 border-b px-3">
	<Search class="size-4 shrink-0 opacity-50" />
	<CommandPrimitive.Input
		bind:ref
		bind:value
		data-slot="command-input"
		class={cn(
			'flex h-10 w-full min-w-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50',
			className
		)}
		{...restProps}
	/>
</div>
