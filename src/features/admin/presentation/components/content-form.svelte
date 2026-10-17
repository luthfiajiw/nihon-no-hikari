<script lang="ts">
	import QuestionSetQuestionsEditor from './question-set-questions-editor.svelte';
	import { untrack } from 'svelte';
	import AdminPageHeader from './admin-page-header.svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Button } from '$lib/components/ui/button';
	import type { AdminEditorData } from '../../domain/entities/admin.entity';
	import type { AdminFormResult } from '../models/admin-view.model';
	import {
		initialAdminContent,
		type AdminContentFormItem
	} from '../models/admin-content-form.model';
	import LessonEditor from '$features/admin/presentation/components/lesson-editor.svelte';
	import { contentPayload } from '$features/admin/domain/content-policy';
	import { ArrowLeft } from 'lucide-svelte';
	import StatusBadge from '$features/admin/presentation/components/status-badge.svelte';
	import PrerequisiteCombobox from './prerequisite-combobox.svelte';

	let { data, form }: { data: AdminEditorData; form?: AdminFormResult } = $props();
	const courses = $derived(data.catalog.courses ?? []);
	const modules = $derived(data.catalog.modules ?? []);
	const lessons = $derived(data.catalog.lessons ?? []);
	const levels = $derived(data.levels ?? []);
	const templates = $derived(data.templates ?? []);
	const isNew = $derived(data.id === 'new');
	const live = $derived(data.record as Record<string, unknown> | null);
	const hasDraft = $derived(Boolean(data.draft));
	const archived = $derived(Boolean(live?.archived_at));
	const published = $derived(Boolean(live?.is_published));
	// The parent keys this component by resource, so each editor gets fresh form state.
	let item = $state<AdminContentFormItem>(initialAdminContent(untrack(() => data)));
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
		data.kind === 'course'
			? 'Kursus'
			: data.kind === 'module'
				? 'Module'
				: data.kind === 'lesson'
					? 'Lesson'
					: 'Question Set'
	);
	function changeSkill(next: string) {
		if (
			item.questions.length &&
			!window.confirm('Mengganti skill akan mengosongkan daftar soal. Lanjutkan?')
		)
			return;
		item.skill = next;
		item.questions = [];
	}
	function changeKind(next: string) {
		item.kind = next;
		if (next === 'practice') {
			item.module_id = '';
			item.lesson_id = String(lessons[0]?.id ?? '');
		} else {
			item.lesson_id = null;
			item.module_id = String(modules[0]?.id ?? '');
		}
	}
	function payload(): string {
		return contentPayload(data.kind, item);
	}
</script>

<div class="admin-page">
	<Button variant="outline" size="icon" type="button" onclick={() => window.history.back()}>
		<ArrowLeft />
	</Button>
	<AdminPageHeader title={`${isNew ? 'Buat' : 'Edit'} ${title}`}>
		<div class="flex items-center gap-2">
			<StatusBadge item={{ archived_at: archived, is_published: published }} />
			{#if hasDraft}
				<span class="text-xs text-slate-500">Ada perubahan draft</span>
			{/if}
		</div>
	</AdminPageHeader>
	{#if form?.message}
		<p role="status" class="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
			{form.message}
		</p>
	{/if}
	<form
		method="POST"
		action="?/save"
		use:enhance={submitContent('save')}
		class="admin-page admin-panel"
	>
		<input type="hidden" name="payload" value={payload()} />
		{#if data.kind !== 'question_set'}
			<div class="admin-fields">
				<label class="block text-sm font-medium">
					Judul
					<input bind:value={item.title} required maxlength="160" class="admin-field" />
				</label>
				<label class="block text-sm font-medium">
					Slug
					<input
						bind:value={item.slug}
						required
						pattern="[a-z0-9]+(-[a-z0-9]+)*"
						class="admin-field"
					/>
				</label>
				{#if data.kind === 'course'}
					<label class="block text-sm font-medium">
						Level
						<select bind:value={item.level_id} class="admin-field">
							{#each levels as level (level.id)}
								<option value={String(level.id)}>
									{level.name}
								</option>
							{/each}
						</select>
					</label>
					<label class="block text-sm font-medium">
						Urutan
						<input bind:value={item.order_index} type="number" min="0" class="admin-field" />
					</label>
					<label class="block text-sm font-medium">
						URL thumbnail
						<input bind:value={item.thumbnail_url} type="url" class="admin-field" />
					</label>
				{:else if data.kind === 'module'}
					<label class="block text-sm font-medium">
						Kursus
						<select bind:value={item.course_id} class="admin-field">
							{#each courses as course (course.id)}
								<option value={String(course.id)}>
									{course.title}
								</option>
							{/each}
						</select>
					</label>
					<label class="block text-sm font-medium">
						Urutan
						<input bind:value={item.order_index} type="number" min="0" class="admin-field" />
					</label>
					<label class="block text-sm font-medium">
						Estimasi menit
						<input
							type="number"
							min="0"
							value={item.estimated_minutes ?? ''}
							oninput={(e) =>
								(item.estimated_minutes =
									e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
							class="admin-field"
						/>
					</label>
					<label class="flex items-center gap-2 text-sm">
						<input type="checkbox" bind:checked={item.is_mandatory} />
						Wajib
					</label>
					<label class="flex items-center gap-2 text-sm">
						<input type="checkbox" bind:checked={item.is_entry} />
						Module awal (is_entry)
					</label>
				{:else}
					<label class="block text-sm font-medium">
						Module
						<select bind:value={item.module_id} class="admin-field">
							{#each modules as module (module.id)}
								<option value={String(module.id)}>
									{module.title}
								</option>
							{/each}
						</select>
					</label>
					<label class="block text-sm font-medium">
						Urutan
						<input bind:value={item.order_index} type="number" min="0" class="admin-field" />
					</label>
				{/if}
			</div>
			{#if data.kind === 'lesson'}
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={item.is_entry} />
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
					<textarea
						bind:value={item.description}
						class="mt-1 min-h-24 w-full rounded-lg border px-3 py-2"></textarea>
				</label>
			{/if}
			{#if data.kind === 'lesson'}
				<div>
					<h2 class="mb-3 text-lg font-semibold">Konten Pembelajaran</h2>
					<LessonEditor bind:value={item.content} />
				</div>
			{/if}
		{:else}
			<div class="admin-fields">
				<label class="block text-sm font-medium">
					Judul set
					<input bind:value={item.title} required maxlength="160" class="admin-field" />
				</label>
				<label class="block text-sm font-medium">
					Jenis
					<select
						value={item.kind}
						onchange={(e) => changeKind(e.currentTarget.value)}
						class="admin-field"
					>
						<option value="practice">Latihan lesson</option>
						<option value="final_exam">Ujian module</option>
					</select>
				</label>
				{#if item.kind === 'practice'}
					<label class="block text-sm font-medium">
						Lesson
						<select bind:value={item.lesson_id} class="admin-field">
							{#each lessons as lesson (lesson.id)}
								<option value={String(lesson.id)}>
									{lesson.title}
								</option>
							{/each}
						</select>
					</label>
				{:else}
					<label class="block text-sm font-medium">
						Module
						<select bind:value={item.module_id} class="admin-field">
							{#each modules as module (module.id)}
								<option value={String(module.id)}>
									{module.title}
								</option>
							{/each}
						</select>
					</label>
				{/if}
				<label class="block text-sm font-medium">
					Skill
					<select
						value={item.skill}
						onchange={(e) => changeSkill(e.currentTarget.value)}
						class="admin-field"
					>
						<option value="reading">Reading</option>
						<option value="writing">Writing</option>
					</select>
				</label>
				<label class="block text-sm font-medium">
					Nilai lulus (0–100)
					<input
						bind:value={item.passing_score}
						type="number"
						min="0"
						max="100"
						class="admin-field"
					/>
				</label>
				<label class="block text-sm font-medium">
					Urutan
					<input bind:value={item.order_index} type="number" min="0" class="admin-field" />
				</label>
				<label class="block text-sm font-medium">
					Jumlah soal dipilih (kosong = semua)
					<input
						type="number"
						min="1"
						value={item.total_questions ?? ''}
						oninput={(e) =>
							(item.total_questions =
								e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
						class="admin-field"
					/>
				</label>
				<label class="block text-sm font-medium">
					Batas detik (kosong/0 = tanpa batas)
					<input
						type="number"
						min="0"
						value={item.time_limit_seconds ?? ''}
						oninput={(e) =>
							(item.time_limit_seconds =
								e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
						class="admin-field"
					/>
				</label>
				<label class="block text-sm font-medium">
					Maksimum attempt (kosong = bebas)
					<input
						type="number"
						min="1"
						value={item.max_attempts ?? ''}
						oninput={(e) =>
							(item.max_attempts =
								e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
						class="admin-field"
					/>
				</label>
				<label class="block text-sm font-medium">
					Jeda menit
					<input bind:value={item.cooldown_minutes} type="number" min="0" class="admin-field" />
				</label>
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={item.shuffle_questions} />
					Acak soal
				</label>
			</div>
			<QuestionSetQuestionsEditor bind:questions={item.questions} skill={item.skill} {templates} />
		{/if}
		<Button
			type="submit"
			disabled={pendingAction !== null}
			isLoading={pendingAction === 'save'}
			class="h-auto rounded-lg px-4 py-2 text-sm font-semibold"
		>
			Simpan Draft
		</Button>
	</form>
	{#if !isNew}
		<div class="flex flex-wrap gap-3">
			{#if archived}
				<form method="POST" action="?/restore">
					<button class="rounded-lg border px-4 py-2 text-sm">Pulihkan</button>
				</form>
			{:else}
				<form method="POST" action="?/publish" use:enhance={submitContent('publish')}>
					<Button
						type="submit"
						variant="outline"
						disabled={pendingAction !== null}
						isLoading={pendingAction === 'publish'}
						class="h-auto rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary"
					>
						{hasDraft ? 'Terbitkan Perubahan' : 'Terbitkan'}
					</Button>
				</form>
			{/if}
			<button
				type="button"
				onclick={() => (confirmDelete = !confirmDelete)}
				class="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700"
			>
				Hapus
			</button>
			{#if confirmDelete}
				<form method="POST" action="?/remove">
					<p class="mb-2 text-sm text-red-700">
						Konten dengan riwayat siswa akan diarsipkan. Lanjutkan?
					</p>
					<button class="rounded-lg bg-red-600 px-4 py-2 text-sm text-white">
						Ya, hapus atau arsipkan
					</button>
				</form>
			{/if}
		</div>
	{/if}
</div>
