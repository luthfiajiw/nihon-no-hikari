<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: CommandPrimitive.ItemProps = $props();
</script>

<CommandPrimitive.Item
	bind:ref
	data-slot="command-item"
	class={cn(
		'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-selected:bg-accent data-selected:text-accent-foreground',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.Item>
