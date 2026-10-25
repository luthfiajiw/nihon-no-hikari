<script lang="ts">
	import { page } from '$app/state';
	import AdminKotobaEditorView from '$features/admin/presentation/views/admin-kotoba-editor-view.svelte';
</script>

{#key page.params.id}
	<AdminKotobaEditorView id={page.params.id!} />
{/key}
