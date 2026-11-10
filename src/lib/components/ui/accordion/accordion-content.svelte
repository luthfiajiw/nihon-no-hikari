<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: AccordionPrimitive.ContentProps = $props();
</script>

<AccordionPrimitive.Content
	bind:ref
	data-slot="accordion-content"
	class={cn(
		'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm transition-all',
		className
	)}
	{...restProps}
>
	<div class="pt-0 pb-4">
		{@render children?.()}
	</div>
</AccordionPrimitive.Content>
