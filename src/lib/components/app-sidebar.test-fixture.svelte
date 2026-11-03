<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from './app-sidebar.svelte';

	let { open = true }: { open?: boolean } = $props();
</script>

<Sidebar.Provider {open}>
	<AppSidebar />
	<Sidebar.Inset>
		<Sidebar.Trigger />
	</Sidebar.Inset>
</Sidebar.Provider>
