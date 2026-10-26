<script lang="ts">
	import { page } from '$app/state';
	import AdminKotobaEditorView from '$features/admin/presentation/views/admin-kotoba-editor-view.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

{#key page.params.id}
	<AdminKotobaEditorView id={page.params.id!} initial={data.topic} />
{/key}
