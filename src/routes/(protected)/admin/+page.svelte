<script lang="ts">
	import View from '$features/admin/presentation/views/admin-dashboard-view.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<View {data} />
