<script lang="ts">
	import ContentForm from '../components/content-form.svelte';
	import type { AdminEditorData } from '../../domain/entities/admin.entity';
	import type { AdminFormResult } from '../models/admin-view.model';
	let { data, form }: { data: AdminEditorData; form?: AdminFormResult } = $props();
	const kindLabel = $derived(
		{ course: 'Kursus', module: 'Module', lesson: 'Lesson', question_set: 'Question Set' }[
			data.kind
		]
	);
	const pageTitle = $derived(`${data.id === 'new' ? 'Buat' : 'Edit'} ${kindLabel}`);
</script>

<svelte:head>
	<title>{pageTitle} | Admin - Nihongo no Hikari</title>
	<meta
		name="description"
		content={`${pageTitle} dan kelola konten pembelajaran Nihongo no Hikari.`}
	/>
</svelte:head>

{#key `${data.kind}:${data.id}:${data.parentId ?? ''}`}
	<ContentForm {data} {form} />
{/key}
