<script lang="ts">
	import { page } from '$app/state';
	import KotobaTopicView from '$features/kotoba/presentation/views/kotoba-topic-view.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.topic.title} - Kotoba - Nihongo no Hikari</title>
	<meta name="description" content={data.topic.description} />
</svelte:head>

{#key page.params.id}
	<KotobaTopicView topic={data.topic} />
{/key}
