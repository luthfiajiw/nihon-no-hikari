<script lang="ts">
	import type { LayoutProps } from './$types';
	import {
		createKotobaAdminState,
		setKotobaAdminState
	} from '$features/kotoba/presentation/contexts/kotoba-admin-context.svelte';
	let { children }: LayoutProps = $props();
	setKotobaAdminState(createKotobaAdminState());
</script>

{@render children()}
