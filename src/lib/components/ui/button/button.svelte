<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';

	export const buttonVariants = tv({
		base: "aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-md border border-transparent bg-clip-padding text-sm font-medium [&_svg:not([class*='size-'])]:size-4 group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-[translate,box-shadow,background-color,color,border-color] duration-50 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 select-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground [--button-shadow:color-mix(in_oklch,var(--color-primary),black_25%)]',
				outline:
					'border-border bg-background [--button-shadow:var(--color-border)] hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground',
				secondary:
					'bg-secondary text-secondary-foreground [--button-shadow:color-mix(in_oklch,var(--color-secondary),black_20%)] hover:bg-[color-mix(in_oklch,var(--color-secondary),var(--color-foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
				ghost:
					'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground',
				destructive:
					'bg-destructive/10 [--button-shadow:color-mix(in_oklch,var(--color-destructive),var(--color-background)_65%)] hover:bg-destructive/20 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30',
				link: 'text-primary underline-offset-4 hover:underline'
			},
			size: {
				default:
					'h-8 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] text-[0.8rem] in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
				lg: 'h-9 gap-1.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				icon: 'size-8',
				'icon-xs':
					"size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
				'icon-sm':
					'size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-md',
				'icon-lg': 'size-9'
			}
		},
		compoundVariants: [
			{
				variant: ['default', 'secondary', 'destructive', 'outline'],
				class:
					'rounded-full bg-clip-border shadow-[0_3px_0_var(--button-shadow)] hover:translate-y-1 hover:shadow-[0_0_0_var(--button-shadow)] active:translate-y-1 active:shadow-[0_0_0_var(--button-shadow)]'
			},
			{
				variant: ['default', 'secondary', 'destructive'],
				class: 'border-0'
			}
		],
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
			isLoading?: boolean;
		};
</script>

<script lang="ts">
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';

	let {
		class: className,
		variant = 'default',
		size = 'default',
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		disabled,
		isLoading = false,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : resolve(href as Pathname)}
		aria-disabled={disabled}
		role={disabled ? 'link' : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
		aria-busy={isLoading}
	>
		{#if isLoading}
			<LoaderCircleIcon data-icon="inline-start" class="animate-spin" aria-hidden="true" />
		{/if}
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
		aria-busy={isLoading}
	>
		{#if isLoading}
			<LoaderCircleIcon data-icon="inline-start" class="animate-spin" aria-hidden="true" />
		{/if}
		{@render children?.()}
	</button>
{/if}
