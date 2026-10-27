<script lang="ts">
	import type { ManagementFormResult } from '$lib/models/management-form.model';

	import ContentForm from '../components/question-admin-content-form.svelte';
	import type { QuestionAdminEditorData } from '$features/question/domain/entities/question-admin.entity';

	let { data, form }: { data: QuestionAdminEditorData; form?: ManagementFormResult } = $props();
	const kindLabel = 'Question Set';
	const pageTitle = $derived(`${data.id === 'new' ? 'Buat' : 'Edit'} ${kindLabel}`);
</script>

<svelte:head>
	<title>{pageTitle} | Admin - Gakkobit</title>
	<meta name="description" content={`${pageTitle} dan kelola konten pembelajaran Gakkobit.`} />
</svelte:head>

{#key `${data.kind}:${data.id}:${data.parentId ?? ''}`}
	<ContentForm {data} {form} />
{/key}
