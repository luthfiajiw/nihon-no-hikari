<script lang="ts">
	import AdminPageHeader from '../components/admin-page-header.svelte';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { goto, invalidateAll } from '$app/navigation';
	import { applyAction, deserialize } from '$app/forms';
	import { onMount, tick, untrack } from 'svelte';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { MediaQuery } from 'svelte/reactivity';
	import {
		dragHandleZone,
		dragHandle,
		SHADOW_ITEM_MARKER_PROPERTY_NAME,
		SOURCES,
		TRIGGERS,
		type DndEvent
	} from 'svelte-dnd-action';
	import {
		ArrowLeftIcon,
		ChevronDown,
		FileText,
		GripVertical,
		Layers,
		Pencil,
		Plus
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import StatusBadge from '$features/admin/presentation/components/status-badge.svelte';
	import courseImage from '$lib/assets/images/n5-course-bg.png';
	import type { AdminCourseDetailData } from '../models/admin-view.model';
	import type { AdminRecord, AdminReorderKind } from '../../domain/entities/admin.entity';
	type LessonItem = AdminRecord & { isDndShadowItem?: boolean };
	type ModuleItem = LessonItem & { originalId: string; lessons: LessonItem[] };
	type DragSession = {
		kind: AdminReorderKind;
		parentId: string;
		id: string;
		source: SOURCES;
		before: ModuleItem[];
		zone: HTMLElement;
		cancelled: boolean;
		restoreFocus: boolean;
	};
	let { data }: { data: AdminCourseDetailData } = $props();
	let reordered = $state<ModuleItem[] | null>(null);
	const modules = $derived<ModuleItem[]>(
		reordered ??
			data.modules.map((module) => ({
				...module,
				originalId: module.id,
				lessons: data.lessons.filter((lesson) => lesson.module_id === module.id)
			}))
	);
	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');
	const flipDurationMs = $derived(reducedMotion.current ? 0 : 220);
	let openModules = $state<Record<string, boolean>>(
		untrack(() => Object.fromEntries(data.modules.map((module, index) => [module.id, index < 2])))
	);
	let saving = $state(false);
	let message = $state('');
	let saveError = $state(false);
	let announcement = $state('');
	let dragSession: DragSession | null = null;
	function previewOrder(kind: AdminReorderKind, parentId: string, items: LessonItem[]) {
		reordered =
			kind === 'module'
				? (items as ModuleItem[])
				: modules.map((module) =>
						module.originalId === parentId ? { ...module, lessons: items } : module
					);
	}
	function handleConsider(
		event: CustomEvent<DndEvent<LessonItem>>,
		kind: AdminReorderKind,
		parentId: string
	) {
		event.stopPropagation();
		const { items, info } = event.detail;
		if (info.trigger === TRIGGERS.DRAG_STARTED) {
			dragSession = {
				kind,
				parentId,
				id: info.id,
				source: info.source,
				before: modules.map((module) => ({ ...module, lessons: [...module.lessons] })),
				zone: event.currentTarget as HTMLElement,
				cancelled: false,
				restoreFocus: true
			};
		}
		if (info.trigger === TRIGGERS.DRAG_STOPPED) {
			void finishOrder(items);
		} else {
			previewOrder(kind, parentId, items);
		}
	}
	function handleFinalize(
		event: CustomEvent<DndEvent<LessonItem>>,
		kind: AdminReorderKind,
		parentId: string
	) {
		event.stopPropagation();
		if (event.detail.info.source === SOURCES.KEYBOARD) {
			// Keyboard arrows emit finalize too; wait for Space/Enter before persisting.
			previewOrder(kind, parentId, event.detail.items);
		} else {
			if (event.detail.info.trigger === TRIGGERS.DROPPED_OUTSIDE_OF_ANY && dragSession)
				dragSession.cancelled = true;
			void finishOrder(event.detail.items);
		}
	}
	async function finishOrder(items: LessonItem[]) {
		const session = dragSession;
		if (!session) return;
		dragSession = null;
		if (session.cancelled) {
			reordered = session.before;
			announcement = 'Pemindahan dibatalkan.';
		} else {
			previewOrder(session.kind, session.parentId, items);
			const previous =
				session.kind === 'module'
					? session.before
					: session.before.find((module) => module.originalId === session.parentId)!.lessons;
			if (items.some((item, index) => item.id !== previous[index]?.id)) {
				await saveOrder(
					session,
					items.map((item) => item.id)
				);
			} else {
				announcement = 'Urutan tidak berubah.';
			}
		}
		await tick();
		if (session.restoreFocus && session.zone.isConnected) {
			session.zone
				.querySelector<HTMLElement>(`[data-sort-id="${session.id}"] [data-sort-handle]`)
				?.focus({ preventScroll: true });
		}
	}
	onMount(() => {
		function cancelDrag(event: KeyboardEvent) {
			if (!dragSession || (event.key !== 'Escape' && event.key !== 'Tab')) return;
			dragSession.cancelled = true;
			dragSession.restoreFocus = event.key !== 'Tab';
			if (dragSession.source === SOURCES.POINTER) {
				// Let the library finish its drop animation and cleanup before restoring the snapshot.
				window.dispatchEvent(new MouseEvent('mouseup'));
			} else if (event.key === 'Tab') {
				window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
			}
		}
		window.addEventListener('keydown', cancelDrag, true);
		return () => window.removeEventListener('keydown', cancelDrag, true);
	});
	async function saveOrder(session: DragSession, ids: string[]) {
		if (saving) return;
		const { kind, parentId } = session;
		reordered = modules.map((module, index) =>
			kind === 'module'
				? { ...module, order_index: index }
				: module.originalId === parentId
					? {
							...module,
							lessons: module.lessons.map((lesson, order_index) => ({ ...lesson, order_index }))
						}
					: module
		);
		saving = true;
		saveError = false;
		message = 'Menyimpan urutan…';
		try {
			const form = new FormData();
			form.set('kind', kind);
			form.set('payload', JSON.stringify({ parent_id: parentId, ordered_ids: ids }));
			const response = await fetch('?/reorder', {
				method: 'POST',
				body: form,
				headers: { 'x-sveltekit-action': 'true' }
			});
			const result = deserialize<{ message?: string }, { message?: string }>(await response.text());
			if (result.type === 'redirect') {
				await applyAction(result);
				return;
			}
			if (result.type !== 'success') {
				throw new Error(
					result.type === 'failure'
						? result.data?.message
						: 'Gagal menyimpan urutan. Silakan coba lagi.'
				);
			}
			message = 'Urutan berhasil disimpan.';
			try {
				await invalidateAll();
				reordered = null;
			} catch {
				/* Keep the confirmed local order until data can refresh. */
			}
		} catch (cause) {
			reordered = session.before;
			saveError = true;
			message =
				cause instanceof Error ? cause.message : 'Gagal menyimpan urutan. Silakan coba lagi.';
			try {
				await invalidateAll();
				reordered = null;
			} catch {
				/* Retain the restored order if offline. */
			}
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>{data.course.title} | Admin - Nihongo no Hikari</title>
	<meta name="description" content={`Kelola module dan lesson kursus ${data.course.title}.`} />
</svelte:head>

<div class="admin-page">
	<Button variant="outline" size="icon" type="button" onclick={() => window.history.back()}>
		<ArrowLeftIcon />
	</Button>
	<AdminPageHeader
		title="Kursus & Materi"
		description="Susun module dan lesson untuk kursus ini."
	/>
	<section class="admin-toolbar sm:p-6">
		<img
			src={data.course.thumbnail_url || courseImage}
			alt=""
			class="h-24 w-40 rounded-xl object-cover"
		/>
		<div class="min-w-0 flex-1">
			<StatusBadge item={data.course} />
			<h2 class="mt-2 text-xl font-bold tracking-tight sm:text-2xl">{data.course.title}</h2>
			<p class="mt-1 text-sm text-slate-500">/{data.course.slug}</p>
		</div>
		<div class="flex gap-2">
			<Button
				variant="outline"
				onclick={() => goto(resolve(`/admin/content/course/${data.course.id}` as Pathname))}
				class="px-4"
			>
				<Pencil class="size-4" /> Edit Kursus
			</Button>
			<Button
				onclick={() =>
					goto(resolve(`/admin/content/module/new?parent=${data.course.id}` as Pathname))}
			>
				<Plus class="size-4" /> Tambah Module
			</Button>
		</div>
	</section>
	<div class="flex items-center justify-between">
		<h2 class="text-base font-semibold text-slate-800">Struktur pembelajaran</h2>
		<p class="text-xs text-slate-500">
			{data.modules.length} module · {data.lessons.length} lesson
		</p>
	</div>
	<p id="reorder-instructions" class="text-xs text-slate-500">
		Geser pegangan untuk mengubah urutan. Dengan keyboard, tekan Space atau Enter, gunakan panah
		atas/bawah, lalu tekan lagi untuk menyimpan. Escape untuk membatalkan.
	</p>
	<p class="sr-only" aria-live="polite">{announcement}</p>
	{#if message}
		<p
			class="admin-notice {saveError
				? 'border-red-200 bg-red-50 text-red-700'
				: 'border-blue-100 bg-blue-50 text-blue-700'}"
			role="status"
		>
			{message}
		</p>
	{/if}
	<div
		class="admin-stack course-sortable-zone"
		aria-label="Urutan module"
		aria-busy={saving}
		use:dragHandleZone={{
			items: modules,
			type: `course-modules-${data.course.id}`,
			flipDurationMs,
			dragDisabled: saving,
			dropFromOthersDisabled: true,
			useCursorForDetection: true,
			morphDisabled: true,
			zoneTabIndex: -1,
			dropTargetStyle: {}
		}}
		onconsider={(event) => handleConsider(event, 'module', data.course.id)}
		onfinalize={(event) => handleFinalize(event, 'module', data.course.id)}
	>
		{#each modules as module (`${module.id}-${module[SHADOW_ITEM_MARKER_PROPERTY_NAME] ?? false}`)}
			{@const lessons = module.lessons}
			<details
				animate:flip={{ duration: flipDurationMs, easing: cubicOut }}
				data-sort-id={module.originalId}
				data-module-id={module.originalId}
				data-is-dnd-shadow-item-hint={module[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
				aria-label={module.title}
				open={openModules[module.originalId] ?? false}
				ontoggle={(event) => {
					if (!module[SHADOW_ITEM_MARKER_PROPERTY_NAME])
						openModules[module.originalId] = event.currentTarget.open;
				}}
				class="group w-full rounded-2xl border border-slate-200 bg-white p-1.5 text-left shadow-md"
			>
				<summary
					class="flex cursor-pointer list-none flex-wrap items-center gap-3 rounded-xl bg-secondary p-3 [&::-webkit-details-marker]:hidden"
				>
					<span
						use:dragHandle
						role="button"
						tabindex="0"
						data-sort-handle
						inert={saving || modules.length < 2}
						aria-disabled={saving || modules.length < 2}
						aria-label={`Geser module ${module.title}`}
						aria-describedby="reorder-instructions"
						onclick={(event) => {
							event.preventDefault();
							event.stopPropagation();
						}}
						onkeydown={(event) => {
							if (event.key === ' ' || event.key === 'Enter') event.preventDefault();
						}}
						class="flex shrink-0 cursor-grab touch-none items-center justify-center text-slate-400 aria-disabled:cursor-default aria-disabled:opacity-50"
					>
						<GripVertical class="size-5" />
					</span>
					<h3 class="min-w-24 flex-1 font-semibold text-slate-900">{module.title}</h3>
					<StatusBadge item={module} />
					<span
						class="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-500"
					>
						{lessons.length} lesson
					</span>
					<Button
						variant="outline"
						onclick={() => goto(resolve(`/admin/content/module/${module.originalId}` as Pathname))}
						class="bg-white px-4"
						aria-label={`Edit module ${module.title}`}
					>
						<Pencil class="size-3.5" /> Edit
					</Button>
					<Button
						onclick={() =>
							goto(resolve(`/admin/content/lesson/new?parent=${module.originalId}` as Pathname))}
						class="px-4 text-white"
					>
						<Plus class="size-4" />
						<span class="hidden sm:inline">Tambah</span>
						Lesson
					</Button>
					<ChevronDown class="size-4 text-slate-400 transition-transform group-open:rotate-180" />
				</summary>
				{#if lessons.length > 0}
					<div
						class="course-sortable-zone px-4 py-4 sm:px-6"
						aria-label={`Urutan lesson ${module.title}`}
						use:dragHandleZone={{
							items: lessons,
							type: `module-lessons-${module.originalId}`,
							flipDurationMs,
							dragDisabled: saving,
							dropFromOthersDisabled: true,
							useCursorForDetection: true,
							morphDisabled: true,
							zoneTabIndex: -1,
							dropTargetStyle: {}
						}}
						onconsider={(event) => handleConsider(event, 'lesson', module.originalId)}
						onfinalize={(event) => handleFinalize(event, 'lesson', module.originalId)}
					>
						{#each lessons as lesson, lessonIndex (`${lesson.id}-${lesson[SHADOW_ITEM_MARKER_PROPERTY_NAME] ?? false}`)}
							<div
								animate:flip={{ duration: flipDurationMs, easing: cubicOut }}
								data-sort-id={lesson.id}
								data-lesson-id={lesson.id}
								data-is-dnd-shadow-item-hint={lesson[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
								aria-label={lesson.title}
								class="flex w-full items-center gap-3 border-b border-slate-100 text-sm last:border-0"
							>
								<span
									use:dragHandle
									role="button"
									tabindex="0"
									data-sort-handle
									inert={saving || lessons.length < 2}
									aria-disabled={saving || lessons.length < 2}
									aria-label={`Geser lesson ${lesson.title}`}
									aria-describedby="reorder-instructions"
									onclick={(event) => {
										event.preventDefault();
										event.stopPropagation();
									}}
									onkeydown={(event) => {
										if (event.key === ' ' || event.key === 'Enter') event.preventDefault();
									}}
									class="flex size-10 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-blue-600 aria-disabled:cursor-default aria-disabled:opacity-50"
								>
									<GripVertical class="size-4" />
								</span>
								<button
									type="button"
									onclick={() => goto(resolve(`/admin/content/lesson/${lesson.id}` as Pathname))}
									class="flex min-w-0 flex-1 items-center gap-3 py-3 text-left text-sm transition-colors hover:text-blue-600"
								>
									<span
										class="flex h-6 min-w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-medium text-slate-500"
									>
										{lessonIndex + 1}
									</span>
									<span class="min-w-0 flex-1 truncate font-medium">{lesson.title}</span>
									<StatusBadge item={lesson} />
									<Pencil class="size-3.5 shrink-0 text-slate-400" />
								</button>
							</div>
						{/each}
					</div>
				{:else}
					<div class="flex items-center gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6">
						<FileText class="size-5 text-slate-300" /> Belum ada lesson. Tambahkan materi pertama untuk
						module ini.
					</div>
				{/if}
			</details>
		{/each}
	</div>
	{#if modules.length === 0}
		<div class="admin-empty rounded-2xl border border-dashed bg-white">
			<Layers class="mx-auto mb-3 size-10 text-slate-300" />
			<h3 class="font-semibold">Belum ada module</h3>
			<p class="mt-2 text-sm text-slate-500">
				Tambahkan module untuk mulai menyusun materi kursus.
			</p>
		</div>
	{/if}
</div>

<style>
	.course-sortable-zone > :global([data-is-dnd-shadow-item-hint='true']) {
		visibility: visible !important;
		border-radius: 12px;
		background: #eff6ff;
		outline: 2px dashed #93c5fd;
		outline-offset: -2px;
	}
	.course-sortable-zone > :global([data-is-dnd-shadow-item-hint='true']) > :global(*) {
		visibility: hidden;
	}
	:global(#dnd-action-dragged-el) {
		background: white;
		border-radius: 12px;
		box-shadow: 0 18px 40px -12px rgb(15 23 42 / 25%);
		outline: 1px solid #bfdbfe;
		cursor: grabbing;
	}
</style>
