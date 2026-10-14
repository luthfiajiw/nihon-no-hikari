<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	let {
		ref = $bindable(null),
		value = $bindable(''),
		class: className,
		children,
		...restProps
	}: CommandPrimitive.RootProps = $props();
</script>

<CommandPrimitive.Root
	bind:ref
	bind:value
	data-slot="command"
	class={cn(
		'flex size-full flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.Root>
