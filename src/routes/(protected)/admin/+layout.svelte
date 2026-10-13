<script lang="ts">
	import type { LayoutProps } from './$types';
	let { children }: LayoutProps = $props();
</script>

<div class="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8" data-sveltekit-preload-data="hover">
	{@render children?.()}
</div>
