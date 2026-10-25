<script lang="ts">
	import type { LayoutProps } from './$types';
	import {
		createAdminKotobaState,
		setAdminKotobaState
	} from '$features/admin/presentation/contexts/admin-kotoba-context.svelte';
	let { children }: LayoutProps = $props();
	setAdminKotobaState(createAdminKotobaState());
</script>

{@render children()}
