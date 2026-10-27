<script lang="ts">
	import '$lib/styles/management.css';
	import type { LayoutProps } from './$types';
	let { children }: LayoutProps = $props();
</script>

<div class="admin-shell">
	{@render children?.()}
</div>
