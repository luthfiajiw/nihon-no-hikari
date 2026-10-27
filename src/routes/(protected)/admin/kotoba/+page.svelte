<script lang="ts">
	import KotobaAdminView from '$features/kotoba/presentation/views/kotoba-admin-view.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<KotobaAdminView topics={data.topics} />
