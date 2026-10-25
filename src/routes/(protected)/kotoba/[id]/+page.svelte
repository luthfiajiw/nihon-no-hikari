<script lang="ts">
	import { page } from '$app/state';
	import { exampleKotobaTopicDetail } from '$features/kotoba/data/kotoba-topic-detail';
	import KotobaTopicView from '$features/kotoba/presentation/views/kotoba-topic-view.svelte';
</script>

<svelte:head>
	<title>{exampleKotobaTopicDetail.title} - Kotoba - Nihongo no Hikari</title>
	<meta name="description" content={exampleKotobaTopicDetail.description} />
</svelte:head>

{#key page.params.id}
	<KotobaTopicView topic={exampleKotobaTopicDetail} />
{/key}
