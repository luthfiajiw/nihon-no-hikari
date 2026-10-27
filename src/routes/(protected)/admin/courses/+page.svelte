<script lang="ts">
	import View from '$features/course/presentation/views/course-admin-courses-view.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<View {data} />
