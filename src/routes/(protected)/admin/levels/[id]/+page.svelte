<script lang="ts">
	import View from '$features/course/presentation/views/course-admin-level-editor-view.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

{#if data.level}
	{#key data.id}
		<View data={{ level: data.level, id: data.id }} {form} />
	{/key}
{/if}
