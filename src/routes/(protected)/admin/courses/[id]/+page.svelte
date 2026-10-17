<script lang="ts">
	import View from '$features/admin/presentation/views/admin-course-detail-view.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

{#key data.course.id}
	<View {data} />
{/key}
