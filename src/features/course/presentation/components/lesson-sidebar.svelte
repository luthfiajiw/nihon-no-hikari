<script lang="ts">
	import * as ScrollArea from '$lib/components/ui/scroll-area';
	import * as Sheet from '$lib/components/ui/sheet';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte.js';
	import LessonSidebarHeader from './lesson-sidebar-header.svelte';
	import LessonSidebarTabs from './lesson-sidebar-tabs.svelte';
	import LessonModuleList from './lesson-module-list.svelte';
	import { PanelRightCloseIcon, PanelRightOpenIcon } from 'lucide-svelte';
	import type { Status } from '../../domain/entities/course.entity';

	interface Lesson {
		id: string;
		title: string;
		order: string;
		status?: Status;
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
		isMobileOpen?: boolean;
		onToggle?: () => void;
		onLessonSelect?: (lessonId: string) => void;
	}

	let {
		courseName = 'JLPT N5: Dasar Bahasa Jepang & Kana',
		completedLessons = 8,
		totalLessons = 131,
		modules = [],
		activeLessonId = '',
		isOpen = true,
		isMobileOpen = $bindable(false),
		onToggle,
		onLessonSelect
	}: Props = $props();

	let activeTab = $state('modules');
	const isMobile = new IsMobile();

	$effect(() => {
		if (!isMobile.current && isMobileOpen) {
			isMobileOpen = false;
		}
	});

	function handleMobileLessonSelect(lessonId: string): void {
		onLessonSelect?.(lessonId);
		isMobileOpen = false;
	}
</script>

{#snippet sidebarBody(selectLesson?: (lessonId: string) => void)}
	<LessonSidebarHeader {courseName} {completedLessons} {totalLessons} />

	<div class="border-b border-border px-4 pb-3">
		<LessonSidebarTabs {activeTab} onTabChange={(tab) => (activeTab = tab)} />
	</div>

	<div class="min-h-0 flex-1 overflow-hidden">
		{#if activeTab === 'modules'}
			<ScrollArea.Root class="h-full" orientation="vertical">
				<LessonModuleList {modules} {activeLessonId} onLessonSelect={selectLesson} />
			</ScrollArea.Root>
		{:else}
			<div class="flex h-full items-center justify-center p-8">
				<div class="flex flex-col items-center gap-2 text-center">
					<span class="mb-1 text-4xl">🤖</span>
					<p class="text-sm font-semibold text-foreground">Tanya AI akan segera hadir!</p>
					<p class="text-xs text-muted-foreground">Fitur ini masih dalam pengembangan.</p>
				</div>
			</div>
		{/if}
	</div>
{/snippet}

<!-- Mobile Trigger & Sheet -->
<div class="absolute top-14 right-4 md:hidden">
	<Sheet.Root bind:open={isMobileOpen}>
		<Sheet.Trigger>
			{#snippet child({ props })}
				<button
					type="button"
					class="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
					title="Buka daftar materi"
					aria-label="Buka daftar materi"
					{...props}
				>
					<PanelRightOpenIcon class="size-4.5" />
				</button>
			{/snippet}
		</Sheet.Trigger>

		<Sheet.Content
			side="right"
			class="flex h-full w-[300px] max-w-[85vw] flex-col gap-0 p-0 sm:max-w-sm"
		>
			<Sheet.Header class="sr-only">
				<Sheet.Title>{courseName || 'Daftar Materi'}</Sheet.Title>
				<Sheet.Description>Daftar modul dan materi kursus</Sheet.Description>
			</Sheet.Header>

			<div class="flex h-full min-h-0 flex-col overflow-hidden">
				{@render sidebarBody(handleMobileLessonSelect)}
			</div>
		</Sheet.Content>
	</Sheet.Root>
</div>

<!-- Desktop Sidebar -->
<div class="hidden md:flex md:items-start">
	<div class={`absolute top-14 ${isOpen ? 'right-77' : 'right-5'}`}>
		<button
			type="button"
			class="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
			onclick={onToggle}
			title={isOpen ? 'Tutup sidebar' : 'Buka sidebar'}
			aria-label={isOpen ? 'Tutup sidebar' : 'Buka sidebar'}
		>
			{#if !isOpen}
				<PanelRightOpenIcon class="size-4.5" />
			{:else}
				<PanelRightCloseIcon class="size-4.5" />
			{/if}
		</button>
	</div>

	{#if isOpen}
		<aside
			class="flex h-full w-[300px] max-w-[300px] min-w-[300px] flex-col overflow-hidden border-l border-border bg-background"
		>
			{@render sidebarBody(onLessonSelect)}
		</aside>
	{/if}
</div>
