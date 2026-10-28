<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';

	export const buttonVariants = tv({
		base: "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border-2 border-transparent bg-clip-padding text-sm font-semibold outline-none transition-[translate,box-shadow,background-color,color,border-color] duration-150 ease-out select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		variants: {
			variant: {
				default:
					'border-[color-mix(in_oklch,var(--color-primary),black_25%)] bg-primary text-primary-foreground [--button-shadow:color-mix(in_oklch,var(--color-primary),black_35%)] hover:bg-[color-mix(in_oklch,var(--color-primary),var(--color-primary-foreground)_10%)] aria-expanded:bg-primary/90',
				outline:
					'border-taupe-400 bg-background text-foreground [--button-shadow:var(--color-taupe-400)] hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-taupe-500 dark:[--button-shadow:var(--color-taupe-600)]',
				secondary:
					'border-border bg-secondary text-secondary-foreground [--button-shadow:color-mix(in_oklch,var(--color-secondary),var(--color-foreground)_25%)] hover:bg-[color-mix(in_oklch,var(--color-secondary),var(--color-foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
				ghost:
					'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground',
				destructive:
					'border-destructive/40 bg-destructive/10 text-destructive [--button-shadow:color-mix(in_oklch,var(--color-destructive),var(--color-background)_45%)] hover:bg-destructive/20 focus-visible:ring-destructive dark:bg-destructive/20 dark:hover:bg-destructive/30',
				link: 'text-primary underline-offset-4 hover:underline'
			},
			size: {
				default: 'h-10 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
				xs: "h-6 gap-1 rounded-lg px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-8 gap-1.5 rounded-lg px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
				lg: 'h-12 rounded-2xl px-5 text-base font-bold has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
				icon: 'size-10 rounded-full',
				'icon-xs':
					"size-6 rounded-lg in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
				'icon-sm': 'size-8 rounded-lg in-data-[slot=button-group]:rounded-md',
				'icon-lg': 'size-12 rounded-2xl'
			}
		},
		compoundVariants: [
			{
				variant: ['default', 'secondary', 'destructive', 'outline'],
				class:
					'bg-clip-border shadow-[2px_4px_0_var(--button-shadow),inset_0_2px_0_rgb(255_255_255/0.35)] active:trantaupe-y-1 active:shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] data-[flat]:shadow-none data-[flat]:active:trantaupe-y-0'
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
		data-variant={variant}
		data-size={size}
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
		data-variant={variant}
		data-size={size}
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
