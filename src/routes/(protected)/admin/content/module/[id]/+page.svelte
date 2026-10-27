<script lang="ts">
	import View from '$features/course/presentation/views/course-admin-editor-view.svelte';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>

<View {data} {form} />
