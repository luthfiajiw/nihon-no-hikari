<script lang="ts">
	import ContentForm from './content-form.svelte';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>

{#key `${data.kind}:${data.id}:${data.parentId ?? ''}`}
	<ContentForm {data} {form} />
{/key}
