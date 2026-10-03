<script lang="ts">
	import LessonView from '$features/course/presentation/views/lesson-view.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Kelas - Nihongo no Hikari</title>
	<meta name="description" content="Halaman pelajaran kursus bahasa Jepang" />
</svelte:head>

<LessonView
	courseId={data.courseId}
	moduleLessons={data.moduleLessons}
	errorMessage={data.moduleLessonsError}
/>
