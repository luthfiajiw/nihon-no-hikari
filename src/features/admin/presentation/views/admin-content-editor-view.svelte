<script lang="ts">
	import ContentForm from '../components/content-form.svelte';
	import type { AdminEditorData } from '../../domain/entities/admin.entity';
	import type { AdminFormResult } from '../models/admin-view.model';
	let { data, form }: { data: AdminEditorData; form?: AdminFormResult } = $props();
</script>

{#key `${data.kind}:${data.id}:${data.parentId ?? ''}`}
	<ContentForm {data} {form} />
{/key}
