<script lang="ts">
	import AssessmentView from '$features/question/presentation/views/assessment-view.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<AssessmentView {...data} />
