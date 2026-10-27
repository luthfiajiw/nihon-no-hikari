<script lang="ts">
	import KanaTemplateEditorView from '$features/question/presentation/views/question-admin-kana-template-editor-view.svelte';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>

{#key data.record?.id ?? 'new'}
	<KanaTemplateEditorView {data} {form} />
{/key}
