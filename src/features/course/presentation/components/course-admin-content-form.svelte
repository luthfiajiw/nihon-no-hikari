<script lang="ts">
	import type { ManagementFormResult } from '$lib/models/management-form.model';

	import { untrack } from 'svelte';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { CourseAdminEditorData } from '$features/course/domain/entities/course-admin.entity';

	import {
		initialCourseAdminContent,
		type CourseAdminContentFormItem
	} from '$features/course/presentation/models/course-admin-content-form.model';
	import LessonEditor from '$features/course/presentation/components/course-lesson-editor.svelte';
	import { courseAdminContentPayload } from '$features/course/domain/course-admin-content-policy';
	import { ArrowLeft } from 'lucide-svelte';
	import StatusBadge from '$lib/components/content-status-badge.svelte';
	import PrerequisiteCombobox from '$features/course/presentation/components/course-prerequisite-combobox.svelte';
	import ManagementSelect from '$lib/components/management-select.svelte';

	let { data, form }: { data: CourseAdminEditorData; form?: ManagementFormResult } = $props();
	const courses = $derived(data.catalog.courses ?? []);
	const lessons = $derived(data.catalog.lessons ?? []);
	const modules = $derived(data.catalog.modules ?? []);
	const levels = $derived(data.levels ?? []);
	const levelOptions = $derived(
		levels.map((level) => ({ value: String(level.id), label: String(level.name) }))
	);
	const courseOptions = $derived(
		courses.map((course) => ({ value: String(course.id), label: course.title }))
	);
	const moduleOptions = $derived(
		modules.map((module) => ({ value: String(module.id), label: module.title }))
	);
	const isNew = $derived(data.id === 'new');
	const live = $derived(data.record as Record<string, unknown> | null);
	const hasDraft = $derived(Boolean(data.draft));
	const archived = $derived(Boolean(live?.archived_at));
	const published = $derived(Boolean(live?.is_published));
	// The parent keys this component by resource, so each editor gets fresh form state.
	let item = $state<CourseAdminContentFormItem>(initialCourseAdminContent(untrack(() => data)));
	let confirmDelete = $state(false);
	let pendingAction = $state<'save' | 'publish' | null>(null);
	function submitContent(action: 'save' | 'publish'): SubmitFunction {
		return ({ cancel }) => {
			if (pendingAction) {
				cancel();
				return;
			}
			pendingAction = action;
			return async ({ update }) => {
				try {
					await update({ reset: false });
				} finally {
					pendingAction = null;
				}
			};
		};
	}
	const title = $derived(
		data.kind === 'course' ? 'Kursus' : data.kind === 'module' ? 'Module' : 'Lesson'
	);
	function payload(): string {
		return courseAdminContentPayload(data.kind, item);
	}
</script>

<div class="admin-page">
	<Button variant="outline" size="icon" type="button" onclick={() => window.history.back()}>
		<ArrowLeft />
	</Button>
	<ManagementPageHeader title={`${isNew ? 'Buat' : 'Edit'} ${title}`}>
		<div class="flex items-center gap-2">
			<StatusBadge item={{ archived_at: archived, is_published: published }} />
			{#if hasDraft}
				<span class="text-xs text-muted-foreground">Ada perubahan draft</span>
			{/if}
		</div>
	</ManagementPageHeader>
	{#if form?.message}
		<p
			role="status"
			class="rounded-lg border border-taupe-200 bg-taupe-50 p-4 text-sm text-taupe-800 dark:border-taupe-800 dark:bg-taupe-950 dark:text-taupe-200"
		>
			{form.message}
		</p>
	{/if}
	<form
		id="course-content-form"
		method="POST"
		action="?/save"
		use:enhance={submitContent('save')}
		data-slot="card"
		data-size="default"
	>
		<div class={Card.cardVariants({ class: 'admin-page block px-(--card-spacing)' })}>
			<Input type="hidden" name="payload" value={payload()} />
			<div class="admin-fields">
				<label class="block text-sm font-medium">
					Judul
					<Input bind:value={item.title} required maxlength={160} class="mt-2 h-10" />
				</label>
				<label class="block text-sm font-medium">
					Slug
					<Input
						bind:value={item.slug}
						required
						pattern="[a-z0-9]+(-[a-z0-9]+)*"
						class="mt-2 h-10"
					/>
				</label>
				{#if data.kind === 'course'}
					<label class="block text-sm font-medium">
						Level
						<ManagementSelect bind:value={item.level_id} options={levelOptions} class="mt-2" />
					</label>
					<label class="block text-sm font-medium">
						Urutan
						<Input bind:value={item.order_index} type="number" min="0" class="mt-2 h-10" />
					</label>
					<label class="block text-sm font-medium">
						URL thumbnail
						<Input bind:value={item.thumbnail_url} type="url" class="mt-2 h-10" />
					</label>
				{:else if data.kind === 'module'}
					<label class="block text-sm font-medium">
						Kursus
						<ManagementSelect bind:value={item.course_id} options={courseOptions} class="mt-2" />
					</label>
					<label class="block text-sm font-medium">
						Urutan
						<Input bind:value={item.order_index} type="number" min="0" class="mt-2 h-10" />
					</label>
					<label class="block text-sm font-medium">
						Estimasi menit
						<Input
							type="number"
							min="0"
							value={item.estimated_minutes ?? ''}
							oninput={(e) =>
								(item.estimated_minutes =
									e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
							class="mt-2 h-10"
						/>
					</label>
					<label class="flex items-center gap-2 text-sm">
						<Checkbox bind:checked={item.is_mandatory} />
						Wajib
					</label>
					<label class="flex items-center gap-2 text-sm">
						<Checkbox bind:checked={item.is_entry} />
						Module awal (is_entry)
					</label>
				{:else}
					<label class="block text-sm font-medium">
						Module
						<ManagementSelect bind:value={item.module_id} options={moduleOptions} class="mt-2" />
					</label>
					<label class="block text-sm font-medium">
						Urutan
						<Input bind:value={item.order_index} type="number" min="0" class="mt-2 h-10" />
					</label>
				{/if}
			</div>
			{#if data.kind === 'lesson'}
				<label class="flex items-center gap-2 text-sm">
					<Checkbox bind:checked={item.is_entry} />
					Lesson awal (is_entry)
				</label>
			{/if}
			{#if data.kind === 'module' && !item.is_entry}
				<PrerequisiteCombobox
					id="module-prerequisites"
					label="Prasyarat module"
					value={item.module_prerequisites[0] ?? ''}
					onValueChange={(value) => (item.module_prerequisites = value ? [value] : [])}
					options={modules
						.filter((module) => module.id !== data.id)
						.map((module) => ({
							id: module.id,
							label: `${courses.find((course) => course.id === module.course_id)?.title ?? 'Kursus'} / ${module.title}`
						}))}
				/>
			{:else if data.kind === 'lesson' && !item.is_entry}
				<PrerequisiteCombobox
					id="lesson-prerequisites"
					label="Prasyarat lesson"
					value={item.lesson_prerequisites[0] ?? ''}
					onValueChange={(value) => (item.lesson_prerequisites = value ? [value] : [])}
					options={lessons
						.filter((lesson) => lesson.id !== data.id)
						.map((lesson) => ({
							id: lesson.id,
							label: `${modules.find((module) => module.id === lesson.module_id)?.title ?? 'Module'} / ${lesson.title}`
						}))}
				/>
			{/if}
			{#if data.kind !== 'lesson'}
				<label class="block text-sm font-medium">
					Deskripsi
					<Textarea bind:value={item.description} class="mt-2 min-h-24" />
				</label>
			{/if}
		</div>

		{#if data.kind === 'lesson'}
			<div class="mt-4">
				<LessonEditor bind:value={item.content} />
			</div>
		{/if}
	</form>

	<div class="flex justify-between">
		<Button
			type="submit"
			form="course-content-form"
			disabled={pendingAction !== null}
			isLoading={pendingAction === 'save'}
		>
			Simpan Draft
		</Button>

		<div class="flex flex-wrap gap-3">
			<Button type="button" variant="destructive" onclick={() => (confirmDelete = !confirmDelete)}>
				Hapus
			</Button>
			{#if !isNew}
				{#if archived}
					<form method="POST" action="?/restore">
						<Button type="submit" variant="outline">Pulihkan</Button>
					</form>
				{:else}
					<form method="POST" action="?/publish" use:enhance={submitContent('publish')}>
						<Button
							type="submit"
							variant="outline"
							disabled={pendingAction !== null}
							isLoading={pendingAction === 'publish'}
						>
							{hasDraft ? 'Terbitkan Perubahan' : 'Terbitkan'}
						</Button>
					</form>
				{/if}
				{#if confirmDelete}
					<form method="POST" action="?/remove">
						<p class="mb-2 text-sm text-red-700">
							Konten dengan riwayat siswa akan diarsipkan. Lanjutkan?
						</p>
						<Button type="submit" variant="destructive">Ya, hapus atau arsipkan</Button>
					</form>
				{/if}
			{/if}
		</div>
	</div>
</div>
