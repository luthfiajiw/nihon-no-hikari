<script lang="ts">
	import KanaTemplatesView from '$features/admin/presentation/views/admin-kana-templates-view.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<KanaTemplatesView {data} />
