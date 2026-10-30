<script lang="ts">
	import type { ManagementFormResult } from '$lib/models/management-form.model';

	import QuestionSetQuestionsEditor from '$features/question/presentation/components/question-set-questions-editor.svelte';
	import { untrack } from 'svelte';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import type { QuestionAdminEditorData } from '$features/question/domain/entities/question-admin.entity';

	import {
		initialQuestionAdminContent,
		type QuestionAdminContentFormItem
	} from '$features/question/presentation/models/question-admin-content-form.model';
	import { questionAdminContentPayload } from '$features/question/domain/question-admin-content-policy';
	import { ArrowLeft } from 'lucide-svelte';
	import StatusBadge from '$lib/components/content-status-badge.svelte';
	import ManagementSelect from '$lib/components/management-select.svelte';

	let { data, form }: { data: QuestionAdminEditorData; form?: ManagementFormResult } = $props();
	const modules = $derived(data.catalog.modules ?? []);
	const lessons = $derived(data.catalog.lessons ?? []);
	const templates = $derived(data.templates ?? []);
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
	let item = $state<QuestionAdminContentFormItem>(initialQuestionAdminContent(untrack(() => data)));
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
	const title = 'Question Set';
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
		return questionAdminContentPayload(item);
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
		method="POST"
		action="?/save"
		id="question-set-form"
		use:enhance={submitContent('save')}
		data-slot="card"
		data-size="default"
	>
		<div class={Card.cardVariants({ class: 'admin-page block px-(--card-spacing)' })}>
			<Input type="hidden" name="payload" value={payload()} />
			<div class="admin-fields">
				<label class="block text-sm font-medium">
					Judul set
					<Input bind:value={item.title} required maxlength={160} class="mt-2 h-10" />
				</label>
				<label class="block text-sm font-medium">
					Jenis
					<ManagementSelect
						bind:value={() => item.kind, changeKind}
						options={kindOptions}
						class="mt-2"
					/>
				</label>
				{#if item.kind === 'practice'}
					<label class="block text-sm font-medium">
						Lesson
						<ManagementSelect
							bind:value={() => item.lesson_id ?? '', (value) => (item.lesson_id = value || null)}
							options={lessonOptions}
							class="mt-2"
						/>
					</label>
				{:else}
					<label class="block text-sm font-medium">
						Module
						<ManagementSelect bind:value={item.module_id} options={moduleOptions} class="mt-2" />
					</label>
				{/if}
				<label class="block text-sm font-medium">
					Skill
					<ManagementSelect
						bind:value={() => item.skill, changeSkill}
						options={skillOptions}
						class="mt-2"
					/>
				</label>
				<label class="block text-sm font-medium">
					KKM (0–100)
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
		</div>
		<QuestionSetQuestionsEditor bind:questions={item.questions} skill={item.skill} {templates} />
	</form>
	<div class="flex justify-between">
		<Button
			type="submit"
			form="question-set-form"
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
