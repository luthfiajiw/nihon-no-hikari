<script lang="ts">
	import type { ManagementFormResult } from '$lib/models/management-form.model';

	import ContentForm from '../components/course-admin-content-form.svelte';
	import type { CourseAdminEditorData } from '$features/course/domain/entities/course-admin.entity';

	let { data, form }: { data: CourseAdminEditorData; form?: ManagementFormResult } = $props();
	const kindLabel = $derived({ course: 'Kursus', module: 'Module', lesson: 'Lesson' }[data.kind]);
	const pageTitle = $derived(`${data.id === 'new' ? 'Buat' : 'Edit'} ${kindLabel}`);
</script>

<svelte:head>
	<title>{pageTitle} | Admin - Gakkobit</title>
	<meta name="description" content={`${pageTitle} dan kelola konten pembelajaran Gakkobit.`} />
</svelte:head>

{#key `${data.kind}:${data.id}:${data.parentId ?? ''}`}
	<ContentForm {data} {form} />
{/key}
