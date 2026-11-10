<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		...restProps
	}: AccordionPrimitive.RootProps = $props();
</script>

{#if restProps.type === 'single'}
	<AccordionPrimitive.Root
		bind:ref
		bind:value={value as string}
		data-slot="accordion"
		class={cn('w-full', className)}
		{...restProps}
	/>
{:else}
	<AccordionPrimitive.Root
		bind:ref
		bind:value={value as string[]}
		data-slot="accordion"
		class={cn('w-full', className)}
		{...restProps}
	/>
{/if}
