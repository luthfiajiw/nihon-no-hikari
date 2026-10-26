<script lang="ts">
	import AdminKotobaView from '$features/admin/presentation/views/admin-kotoba-view.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<AdminKotobaView topics={data.topics} />
