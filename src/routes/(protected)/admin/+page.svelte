<script lang="ts">
	import View from './_components/admin-dashboard-view.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<View {data} />
