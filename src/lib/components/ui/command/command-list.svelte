<script lang="ts">
	import { Command as CommandPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: CommandPrimitive.ListProps = $props();
</script>

<CommandPrimitive.List
	bind:ref
	data-slot="command-list"
	class={cn('max-h-64 overflow-x-hidden overflow-y-auto p-1', className)}
	{...restProps}
>
	{@render children?.()}
</CommandPrimitive.List>
