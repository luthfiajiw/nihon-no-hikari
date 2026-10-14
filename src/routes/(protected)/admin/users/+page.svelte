<script lang="ts">
	import View from '$features/admin/presentation/views/admin-users-view.svelte';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>

<View {data} {form} />
