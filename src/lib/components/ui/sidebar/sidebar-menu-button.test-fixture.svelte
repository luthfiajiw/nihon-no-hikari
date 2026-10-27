<script lang="ts">
	import SidebarProvider from './sidebar-provider.svelte';
	import SidebarMenuButton from './sidebar-menu-button.svelte';
</script>

<SidebarProvider open>
	<SidebarMenuButton class="bg-transparent">Inactive</SidebarMenuButton>
	<SidebarMenuButton isActive>Active</SidebarMenuButton>
	<SidebarMenuButton tooltipContent="Settings" class="bg-transparent">
		{#snippet child({ props })}
			<button {...props}>Settings</button>
		{/snippet}
	</SidebarMenuButton>
</SidebarProvider>
