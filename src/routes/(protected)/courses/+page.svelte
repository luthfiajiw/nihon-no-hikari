<script lang="ts">
	import CourseView from '$features/course/presentation/views/course-view.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Kursus - Nihongo no Hikari</title>
	<meta name="description" content="Kursus Nihon No Hikari" />
</svelte:head>

<CourseView courses={data.courses} errorMessage={data.courseError} />
