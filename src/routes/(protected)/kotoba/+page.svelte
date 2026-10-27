<script lang="ts">
	import KotobaView from '$features/kotoba/presentation/views/kotoba-view.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Kotoba - Gakkobit</title>
	<meta
		name="description"
		content="Jelajahi kosakata bahasa Jepang berdasarkan level JLPT dan topik pembelajaran di Gakkobit."
	/>
</svelte:head>

<KotobaView topics={data.topics} />
