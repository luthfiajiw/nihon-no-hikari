<script lang="ts">
	import View from '$features/question/presentation/views/question-admin-sets-view.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<View {data} />
