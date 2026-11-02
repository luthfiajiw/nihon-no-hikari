<script lang="ts">
	import { page } from '$app/state';
	import KotobaPlayView from '$features/kotoba/presentation/views/kotoba-play-view.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Putar {data.topic.title} - Kotoba - Gakkobit</title>
	<meta name="description" content={data.topic.description} />
</svelte:head>

{#key page.params.id}
	<KotobaPlayView topic={data.topic} />
{/key}
