<script lang="ts">
	import View from '$features/user/presentation/views/user-admin-view.svelte';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>

<View {data} {form} />
