<script lang="ts">
	import type { ActionData, PageProps } from './$types';
	import ProfileView from '$features/user/presentation/views/profile-view.svelte';

	let { data, form }: PageProps & { form?: ActionData } = $props();
</script>

<ProfileView {data} {form} />
