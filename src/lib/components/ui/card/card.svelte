<script lang="ts" module>
	import { tv } from 'tailwind-variants';

	// Native forms and sortable details share the same surface without changing their DOM.
	export const cardVariants = tv({
		base: 'group/card flex min-w-0 flex-col gap-(--card-spacing) overflow-hidden rounded-[20px] border-2 border-slate-950 bg-card py-(--card-spacing) text-sm text-card-foreground shadow-[6px_6px_0_var(--color-sky-800)] [--card-spacing:--spacing(6)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(4)] dark:border-slate-200 dark:shadow-[8px_8px_0_var(--color-sky-700)] *:[img:first-child]:rounded-t-[18px] *:[img:last-child]:rounded-b-[18px]'
	});
</script>

<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		size = 'default',
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		size?: 'default' | 'sm';
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="card"
	data-size={size}
	class={cn(cardVariants(), className)}
	{...restProps}
>
	{@render children?.()}
</div>
