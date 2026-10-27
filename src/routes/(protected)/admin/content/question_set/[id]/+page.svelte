<script lang="ts">
	import View from '$features/question/presentation/views/question-admin-editor-view.svelte';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>

<View {data} {form} />
