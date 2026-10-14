<script lang="ts">
	import '$features/admin/presentation/styles/admin.css';
	import type { LayoutProps } from './$types';
	let { children }: LayoutProps = $props();
</script>

<div class="admin-shell">
	{@render children?.()}
</div>
