<script lang="ts">
	import QuestionSetQuestionsEditor from './question-set-questions-editor.svelte';
	import { untrack } from 'svelte';
	import AdminPageHeader from './admin-page-header.svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
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
	import AdminSelect from './admin-select.svelte';

	let { data, form }: { data: AdminEditorData; form?: AdminFormResult } = $props();
	const courses = $derived(data.catalog.courses ?? []);
	const modules = $derived(data.catalog.modules ?? []);
	const lessons = $derived(data.catalog.lessons ?? []);
	const levels = $derived(data.levels ?? []);
	const templates = $derived(data.templates ?? []);
	const levelOptions = $derived(
		levels.map((level) => ({ value: String(level.id), label: String(level.name) }))
	);
	const courseOptions = $derived(
		courses.map((course) => ({ value: String(course.id), label: course.title }))
	);
	const moduleOptions = $derived(
		modules.map((module) => ({ value: String(module.id), label: module.title }))
	);
	const lessonOptions = $derived(
		lessons.map((lesson) => ({ value: String(lesson.id), label: lesson.title }))
	);
	const kindOptions = [
		{ value: 'practice', label: 'Latihan lesson' },
		{ value: 'final_exam', label: 'Ujian module' }
	];
	const skillOptions = [
		{ value: 'reading', label: 'Reading' },
		{ value: 'writing', label: 'Writing' }
	];
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
		<Input type="hidden" name="payload" value={payload()} />
		{#if data.kind !== 'question_set'}
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
						<AdminSelect bind:value={item.level_id} options={levelOptions} class="mt-2" />
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
						<AdminSelect bind:value={item.course_id} options={courseOptions} class="mt-2" />
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
						<AdminSelect bind:value={item.module_id} options={moduleOptions} class="mt-2" />
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
					<Input bind:value={item.title} required maxlength={160} class="mt-2 h-10" />
				</label>
				<label class="block text-sm font-medium">
					Jenis
					<AdminSelect
						bind:value={() => item.kind, changeKind}
						options={kindOptions}
						class="mt-2"
					/>
				</label>
				{#if item.kind === 'practice'}
					<label class="block text-sm font-medium">
						Lesson
						<AdminSelect
							bind:value={() => item.lesson_id ?? '', (value) => (item.lesson_id = value || null)}
							options={lessonOptions}
							class="mt-2"
						/>
					</label>
				{:else}
					<label class="block text-sm font-medium">
						Module
						<AdminSelect bind:value={item.module_id} options={moduleOptions} class="mt-2" />
					</label>
				{/if}
				<label class="block text-sm font-medium">
					Skill
					<AdminSelect
						bind:value={() => item.skill, changeSkill}
						options={skillOptions}
						class="mt-2"
					/>
				</label>
				<label class="block text-sm font-medium">
					Nilai lulus (0–100)
					<Input
						bind:value={item.passing_score}
						type="number"
						min="0"
						max="100"
						class="mt-2 h-10"
					/>
				</label>
				<label class="block text-sm font-medium">
					Urutan
					<Input bind:value={item.order_index} type="number" min="0" class="mt-2 h-10" />
				</label>
				<label class="block text-sm font-medium">
					Jumlah soal dipilih (kosong = semua)
					<Input
						type="number"
						min="1"
						value={item.total_questions ?? ''}
						oninput={(e) =>
							(item.total_questions =
								e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
						class="mt-2 h-10"
					/>
				</label>
				<label class="block text-sm font-medium">
					Batas detik (kosong/0 = tanpa batas)
					<Input
						type="number"
						min="0"
						value={item.time_limit_seconds ?? ''}
						oninput={(e) =>
							(item.time_limit_seconds =
								e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
						class="mt-2 h-10"
					/>
				</label>
				<label class="block text-sm font-medium">
					Maksimum attempt (kosong = bebas)
					<Input
						type="number"
						min="1"
						value={item.max_attempts ?? ''}
						oninput={(e) =>
							(item.max_attempts =
								e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
						class="mt-2 h-10"
					/>
				</label>
				<label class="block text-sm font-medium">
					Jeda menit
					<Input bind:value={item.cooldown_minutes} type="number" min="0" class="mt-2 h-10" />
				</label>
				<label class="flex items-center gap-2 text-sm">
					<Checkbox bind:checked={item.shuffle_questions} />
					Acak soal
				</label>
			</div>
			<QuestionSetQuestionsEditor bind:questions={item.questions} skill={item.skill} {templates} />
		{/if}
		<Button type="submit" disabled={pendingAction !== null} isLoading={pendingAction === 'save'}>
			Simpan Draft
		</Button>
	</form>
	{#if !isNew}
		<div class="flex flex-wrap gap-3">
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
			<Button type="button" variant="destructive" onclick={() => (confirmDelete = !confirmDelete)}>
				Hapus
			</Button>
			{#if confirmDelete}
				<form method="POST" action="?/remove">
					<p class="mb-2 text-sm text-red-700">
						Konten dengan riwayat siswa akan diarsipkan. Lanjutkan?
					</p>
					<Button type="submit" variant="destructive">Ya, hapus atau arsipkan</Button>
				</form>
			{/if}
		</div>
	{/if}
</div>
