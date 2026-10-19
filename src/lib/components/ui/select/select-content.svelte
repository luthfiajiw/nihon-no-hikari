<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn, type WithoutChild, type WithoutChildrenOrChild } from '$lib/utils.js';
	import SelectScrollDownButton from './select-scroll-down-button.svelte';
	import SelectScrollUpButton from './select-scroll-up-button.svelte';

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 4,
		portalProps,
		children,
		preventScroll = true,
		...restProps
	}: WithoutChild<SelectPrimitive.ContentProps> & {
		portalProps?: WithoutChildrenOrChild<SelectPrimitive.PortalProps>;
	} = $props();
</script>

<SelectPrimitive.Portal {...portalProps}>
	<SelectPrimitive.Content
		bind:ref
		{sideOffset}
		{preventScroll}
		data-slot="select-content"
		class={cn(
			'relative z-50 max-h-[min(20rem,var(--bits-select-content-available-height))] min-w-32 origin-(--bits-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg border bg-popover text-popover-foreground shadow-md outline-none',
			className
		)}
		{...restProps}
	>
		<SelectScrollUpButton />
		<SelectPrimitive.Viewport class="w-full min-w-(--bits-select-anchor-width) scroll-my-1 p-1">
			{@render children?.()}
		</SelectPrimitive.Viewport>
		<SelectScrollDownButton />
	</SelectPrimitive.Content>
</SelectPrimitive.Portal>
