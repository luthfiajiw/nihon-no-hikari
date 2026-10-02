<script lang="ts">
	import CourseDetailView from '$features/course/presentation/views/course-detail-view.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.course?.title ?? 'Detail Kursus'} - Nihongo no Hikari</title>
	<meta name="description" content={data.course?.description ?? 'Detail Kursus Nihon No Hikari'} />
</svelte:head>

<CourseDetailView course={data.course} errorMessage={data.courseError} />
