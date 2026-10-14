<script lang="ts">
	import View from '$features/admin/presentation/views/admin-question-sets-view.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<View {data} />
