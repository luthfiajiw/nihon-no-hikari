<script lang="ts">
	import '$lib/styles/management.css';
	import type { LayoutProps } from './$types';
	let { children }: LayoutProps = $props();
</script>

<div class="admin-shell mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
	{@render children?.()}
</div>
