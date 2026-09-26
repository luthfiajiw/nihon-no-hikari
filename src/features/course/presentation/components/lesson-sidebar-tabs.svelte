<script lang="ts">
	import * as Tabs from "$lib/components/ui/tabs";

	interface Props {
		activeTab?: string;
		onTabChange?: (tab: string) => void;
	}

	let { activeTab = "modules", onTabChange }: Props = $props();
</script>

<Tabs.Root value={activeTab} onValueChange={(v) => onTabChange?.(v)}>
	<Tabs.List class="w-full">
		<Tabs.Trigger value="modules" class="flex-1 text-xs">
			Daftar Modul
		</Tabs.Trigger>
		<Tabs.Trigger value="askAI" class="flex-1 text-xs">
			Tanya AI
		</Tabs.Trigger>
	</Tabs.List>
</Tabs.Root>
