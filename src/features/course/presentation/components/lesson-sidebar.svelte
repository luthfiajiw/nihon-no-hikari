<script lang="ts">
	import * as ScrollArea from "$lib/components/ui/scroll-area";
	import LessonSidebarHeader from "./lesson-sidebar-header.svelte";
	import LessonSidebarTabs from "./lesson-sidebar-tabs.svelte";
	import LessonModuleList from "./lesson-module-list.svelte";
	import { PanelRightCloseIcon, PanelRightOpenIcon } from "lucide-svelte";

	interface Lesson {
		id: string;
		title: string;
		order: string;
		status: "completed" | "in_progress" | "not_started";
		isFree?: boolean;
	}

	interface Module {
		id: string;
		title: string;
		order: string;
		completedCount: string;
		lessons: Lesson[];
	}

	interface Props {
		courseName?: string;
		completedLessons?: number;
		totalLessons?: number;
		modules?: Module[];
		activeLessonId?: string;
		isOpen?: boolean;
		onToggle?: () => void;
		onLessonSelect?: (lessonId: string) => void;
	}

	let {
		courseName = "JLPT N5: Dasar Bahasa Jepang & Kana",
		completedLessons = 8,
		totalLessons = 131,
		modules = [],
		activeLessonId = "",
		isOpen = true,
		onToggle,
		onLessonSelect
	}: Props = $props();

	let activeTab = $state("modules");
</script>

<div class="flex items-start">
	<div class={`pt-3.5 ${isOpen ? "pr-1" : "pr-6"}`}>
		<button
			type="button"
			class="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer shrink-0"
			onclick={onToggle}
			title="Buka sidebar"
		>
				{#if !isOpen}
					<PanelRightOpenIcon class="size-4.5" />
				{:else}
					<PanelRightCloseIcon class="size-4.5" />
				{/if}
			</button>
	</div>
	
	{#if isOpen}
		<aside class="flex flex-col w-[300px] min-w-[300px] max-w-[300px] h-full bg-background border-l border-border overflow-hidden">
			<LessonSidebarHeader
				{courseName}
				{completedLessons}
				{totalLessons}
			/>

			<div class="px-4 pb-4 border-b border-border">
				<LessonSidebarTabs
					{activeTab}
					onTabChange={(tab) => (activeTab = tab)}
				/>
			</div>

			<div class="flex-1 min-h-0 overflow-hidden">
				{#if activeTab === "modules"}
					<ScrollArea.Root class="h-full" orientation="vertical">
						<LessonModuleList
							{modules}
							{activeLessonId}
							{onLessonSelect}
						/>
					</ScrollArea.Root>
				{:else}
					<div class="flex items-center justify-center h-full p-8">
						<div class="flex flex-col items-center gap-2 text-center">
							<span class="text-4xl mb-1">🤖</span>
							<p class="text-sm font-semibold text-foreground">Tanya AI akan segera hadir!</p>
							<p class="text-xs text-muted-foreground">Fitur ini masih dalam pengembangan.</p>
						</div>
					</div>
				{/if}
			</div>
		</aside>
	{/if}
</div>
