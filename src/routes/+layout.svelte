<script lang="ts">
	// import type { Pathname } from '$app/types';
	// import { resolve } from '$app/paths';
	// import { page } from '$app/state';
	// import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import '@fontsource-variable/inter';
	import '@fontsource-variable/noto-sans-jp';
	import '@fontsource/kaisei-tokumin';
	import { navigating } from '$app/state';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/x-icon" href={favicon} />
</svelte:head>

{#if navigating.to}
	<div
		class="absolute inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-primary/15"
		role="progressbar"
		aria-label="Memuat halaman"
	>
		<div class="route-progress-indicator h-full bg-primary"></div>
	</div>
{/if}
{@render children?.()}

<!-- <div style="display:none">
	{#each locales as locale (locale)}
		<a
			href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}
		>{locale}</a>
	{/each}
</div> -->
