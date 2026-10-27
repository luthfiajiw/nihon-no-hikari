<script lang="ts">
	import { page } from '$app/state';
	import KotobaAdminEditorView from '$features/kotoba/presentation/views/kotoba-admin-editor-view.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

{#key page.params.id}
	<KotobaAdminEditorView id={page.params.id!} initial={data.topic} />
{/key}
