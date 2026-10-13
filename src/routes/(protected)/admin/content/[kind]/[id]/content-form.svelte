<script lang="ts">
	import type { PageProps } from './$types';
	import LessonEditor from '$lib/components/admin/lesson-editor.svelte';
	import { contentPayload } from '$lib/admin';
	import { ArrowLeft, FilePenLine } from 'lucide-svelte';
	import StatusBadge from '$lib/components/admin/status-badge.svelte';

	type Option = { label: string; media_url: string | null; is_correct: boolean };
	type Question = {
		question_type: string;
		prompt_text: string;
		stimulus_text: string;
		stimulus_media_url: string | null;
		explanation: string;
		points: number;
		stroke_template_id: string | null;
		show_writing_guide: boolean;
		options: Option[];
	};
	type Item = {
		id?: string;
		level_id: string;
		course_id: string;
		module_id: string;
		slug: string;
		title: string;
		description: string;
		thumbnail_url: string;
		order_index: number;
		is_mandatory: boolean;
		is_entry: boolean;
		estimated_minutes: number | null;
		content: { content: string; tips: string; [key: string]: unknown };
		kind: string;
		lesson_id: string | null;
		skill: string;
		passing_score: number;
		total_questions: number | null;
		time_limit_seconds: number | null;
		max_attempts: number | null;
		cooldown_minutes: number;
		shuffle_questions: boolean;
		questions: Question[];
	};
	let { data, form }: Pick<PageProps, 'data' | 'form'> = $props();
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
	function initial(): Item {
		const source = (data.draft ?? data.record ?? {}) as Record<string, unknown>;
		const rawContent =
			source.content && typeof source.content === 'object' && !Array.isArray(source.content)
				? (source.content as Record<string, unknown>)
				: {};
		return {
			id: source.id as string | undefined,
			level_id: String(source.level_id ?? levels[0]?.id ?? ''),
			course_id: String(
				source.course_id ?? (data.kind === 'module' ? data.parentId : null) ?? courses[0]?.id ?? ''
			),
			module_id: String(
				source.module_id ?? (data.kind === 'lesson' ? data.parentId : null) ?? modules[0]?.id ?? ''
			),
			slug: String(source.slug ?? ''),
			title: String(source.title ?? ''),
			description: String(source.description ?? ''),
			thumbnail_url: String(source.thumbnail_url ?? ''),
			order_index: Number(
				source.order_index ??
					(data.kind === 'module'
						? modules.filter((module) => module.course_id === (data.parentId ?? courses[0]?.id))
								.length
						: data.kind === 'lesson'
							? lessons.filter((lesson) => lesson.module_id === (data.parentId ?? modules[0]?.id))
									.length
							: 0)
			),
			is_mandatory: Boolean(source.is_mandatory ?? true),
			is_entry: Boolean(source.is_entry ?? false),
			estimated_minutes: source.estimated_minutes == null ? null : Number(source.estimated_minutes),
			content: {
				...rawContent,
				content: String(rawContent.content ?? ''),
				tips: String(rawContent.tips ?? '')
			},
			kind: String(source.kind ?? 'practice'),
			lesson_id:
				(source.lesson_id as string | null) ??
				(data.parentId || (lessons[0]?.id as string) || null),
			skill: String(source.skill ?? 'reading'),
			passing_score: Number(source.passing_score ?? 80),
			total_questions: source.total_questions == null ? null : Number(source.total_questions),
			time_limit_seconds:
				source.time_limit_seconds == null ? null : Number(source.time_limit_seconds),
			max_attempts: source.max_attempts == null ? null : Number(source.max_attempts),
			cooldown_minutes: Number(source.cooldown_minutes ?? 0),
			shuffle_questions: Boolean(source.shuffle_questions ?? true),
			questions: Array.isArray(source.questions) ? (source.questions as Question[]) : []
		};
	}
	let item = $state<Item>(initial());
	let confirmDelete = $state(false);
	const title = $derived(
		data.kind === 'course'
			? 'Kursus'
			: data.kind === 'module'
				? 'Module'
				: data.kind === 'lesson'
					? 'Lesson'
					: 'Question Set'
	);
	function addQuestion() {
		item.questions.push({
			question_type: item.skill === 'reading' ? 'multiple_choice' : 'stroke_writing',
			prompt_text: '',
			stimulus_text: '',
			stimulus_media_url: null,
			explanation: '',
			points: 1,
			stroke_template_id: null,
			show_writing_guide: true,
			options:
				item.skill === 'reading'
					? [
							{ label: '', media_url: null, is_correct: true },
							{ label: '', media_url: null, is_correct: false }
						]
					: []
		});
	}
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
	const parentCourse = $derived(
		data.kind === 'course'
			? isNew
				? null
				: data.id
			: data.kind === 'module'
				? item.course_id
				: String(modules.find((module) => module.id === item.module_id)?.course_id ?? '')
	);
	const backHref = $derived(
		data.kind === 'question_set'
			? '/admin/question-sets'
			: parentCourse
				? `/admin/courses/${parentCourse}`
				: '/admin/courses'
	);
</script>

<div class="mx-auto max-w-5xl space-y-6">
	<a
		class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
		href={backHref}
		><ArrowLeft class="size-4" /> Kembali ke {parentCourse && data.kind !== 'question_set'
			? 'materi kursus'
			: 'daftar'}</a
	>
	<header class="flex items-center gap-4">
		<div
			class="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600"
		>
			<FilePenLine class="size-7" />
		</div>
		<div>
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
				{isNew ? 'Buat' : 'Edit'}
				{title}
			</h1>
			<div class="mt-2 flex items-center gap-2">
				<StatusBadge item={{ archived_at: archived, is_published: published }} />{#if hasDraft}<span
						class="text-xs text-slate-500">Ada perubahan draft</span
					>{/if}
			</div>
		</div>
	</header>
	{#if form?.message}<p
			role="status"
			class="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm"
		>
			{form.message}
		</p>{/if}
	<form
		method="POST"
		action="?/save"
		class="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
	>
		<input type="hidden" name="payload" value={payload()} />
		{#if data.kind !== 'question_set'}
			<div class="grid gap-4 sm:grid-cols-2">
				<label class="block text-sm font-medium"
					>Judul<input
						bind:value={item.title}
						required
						maxlength="160"
						class="mt-1 w-full rounded-lg border p-2"
					/></label
				>
				<label class="block text-sm font-medium"
					>Slug<input
						bind:value={item.slug}
						required
						pattern="[a-z0-9]+(-[a-z0-9]+)*"
						class="mt-1 w-full rounded-lg border p-2"
					/></label
				>
				{#if data.kind === 'course'}
					<label class="block text-sm font-medium"
						>Level<select bind:value={item.level_id} class="mt-1 w-full rounded-lg border p-2"
							>{#each levels as level}<option value={String(level.id)}>{level.name}</option
								>{/each}</select
						></label
					>
					<label class="block text-sm font-medium"
						>Urutan<input
							bind:value={item.order_index}
							type="number"
							min="0"
							class="mt-1 w-full rounded-lg border p-2"
						/></label
					>
					<label class="block text-sm font-medium"
						>URL thumbnail<input
							bind:value={item.thumbnail_url}
							type="url"
							class="mt-1 w-full rounded-lg border p-2"
						/></label
					>
				{:else if data.kind === 'module'}
					<label class="block text-sm font-medium"
						>Kursus<select bind:value={item.course_id} class="mt-1 w-full rounded-lg border p-2"
							>{#each courses as course}<option value={String(course.id)}>{course.title}</option
								>{/each}</select
						></label
					>
					<label class="block text-sm font-medium"
						>Urutan<input
							bind:value={item.order_index}
							type="number"
							min="0"
							class="mt-1 w-full rounded-lg border p-2"
						/></label
					>
					<label class="block text-sm font-medium"
						>Estimasi menit<input
							type="number"
							min="0"
							value={item.estimated_minutes ?? ''}
							oninput={(e) =>
								(item.estimated_minutes =
									e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
							class="mt-1 w-full rounded-lg border p-2"
						/></label
					>
					<label class="flex items-center gap-2 text-sm"
						><input type="checkbox" bind:checked={item.is_mandatory} /> Wajib</label
					>
					<label class="flex items-center gap-2 text-sm"
						><input type="checkbox" bind:checked={item.is_entry} /> Module awal</label
					>
				{:else}
					<label class="block text-sm font-medium"
						>Module<select bind:value={item.module_id} class="mt-1 w-full rounded-lg border p-2"
							>{#each modules as module}<option value={String(module.id)}>{module.title}</option
								>{/each}</select
						></label
					>
					<label class="block text-sm font-medium"
						>Urutan<input
							bind:value={item.order_index}
							type="number"
							min="0"
							class="mt-1 w-full rounded-lg border p-2"
						/></label
					>
				{/if}
			</div>
			{#if data.kind !== 'lesson'}<label class="block text-sm font-medium"
					>Deskripsi<textarea
						bind:value={item.description}
						class="mt-1 min-h-24 w-full rounded-lg border p-2"></textarea></label
				>{/if}
			{#if data.kind === 'lesson'}<div>
					<h2 class="mb-3 text-lg font-semibold">Konten Pembelajaran</h2>
					<LessonEditor bind:value={item.content} />
				</div>{/if}
		{:else}
			<div class="grid gap-4 sm:grid-cols-2">
				<label class="block text-sm font-medium"
					>Judul set<input
						bind:value={item.title}
						required
						maxlength="160"
						class="mt-1 w-full rounded-lg border p-2"
					/></label
				>
				<label class="block text-sm font-medium"
					>Jenis<select
						value={item.kind}
						onchange={(e) => changeKind(e.currentTarget.value)}
						class="mt-1 w-full rounded-lg border p-2"
						><option value="practice">Latihan lesson</option><option value="final_exam"
							>Ujian module</option
						></select
					></label
				>
				{#if item.kind === 'practice'}<label class="block text-sm font-medium"
						>Lesson<select bind:value={item.lesson_id} class="mt-1 w-full rounded-lg border p-2"
							>{#each lessons as lesson}<option value={String(lesson.id)}>{lesson.title}</option
								>{/each}</select
						></label
					>{:else}<label class="block text-sm font-medium"
						>Module<select bind:value={item.module_id} class="mt-1 w-full rounded-lg border p-2"
							>{#each modules as module}<option value={String(module.id)}>{module.title}</option
								>{/each}</select
						></label
					>{/if}
				<label class="block text-sm font-medium"
					>Skill<select
						value={item.skill}
						onchange={(e) => changeSkill(e.currentTarget.value)}
						class="mt-1 w-full rounded-lg border p-2"
						><option value="reading">Reading</option><option value="writing">Writing</option
						></select
					></label
				>
				<label class="block text-sm font-medium"
					>Nilai lulus (0–100)<input
						bind:value={item.passing_score}
						type="number"
						min="0"
						max="100"
						class="mt-1 w-full rounded-lg border p-2"
					/></label
				>
				<label class="block text-sm font-medium"
					>Urutan<input
						bind:value={item.order_index}
						type="number"
						min="0"
						class="mt-1 w-full rounded-lg border p-2"
					/></label
				>
				<label class="block text-sm font-medium"
					>Jumlah soal dipilih (kosong = semua)<input
						type="number"
						min="1"
						value={item.total_questions ?? ''}
						oninput={(e) =>
							(item.total_questions =
								e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
						class="mt-1 w-full rounded-lg border p-2"
					/></label
				>
				<label class="block text-sm font-medium"
					>Batas detik (kosong/0 = tanpa batas)<input
						type="number"
						min="0"
						value={item.time_limit_seconds ?? ''}
						oninput={(e) =>
							(item.time_limit_seconds =
								e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
						class="mt-1 w-full rounded-lg border p-2"
					/></label
				>
				<label class="block text-sm font-medium"
					>Maksimum attempt (kosong = bebas)<input
						type="number"
						min="1"
						value={item.max_attempts ?? ''}
						oninput={(e) =>
							(item.max_attempts =
								e.currentTarget.value === '' ? null : Number(e.currentTarget.value))}
						class="mt-1 w-full rounded-lg border p-2"
					/></label
				>
				<label class="block text-sm font-medium"
					>Jeda menit<input
						bind:value={item.cooldown_minutes}
						type="number"
						min="0"
						class="mt-1 w-full rounded-lg border p-2"
					/></label
				>
				<label class="flex items-center gap-2 text-sm"
					><input type="checkbox" bind:checked={item.shuffle_questions} /> Acak soal</label
				>
			</div>
			<div class="space-y-4 border-t pt-5">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold">Soal ({item.questions.length})</h2>
					<button type="button" onclick={addQuestion} class="rounded-lg border px-3 py-2 text-sm"
						>Tambah Soal</button
					>
				</div>
				{#each item.questions as question, i}<div
						class="space-y-3 rounded-xl border bg-slate-50 p-4"
					>
						<div class="flex justify-between">
							<h3 class="font-semibold">Soal {i + 1}</h3>
							<button
								type="button"
								class="text-sm text-red-700"
								onclick={() => item.questions.splice(i, 1)}>Hapus Soal</button
							>
						</div>
						<label class="block text-sm"
							>Instruksi<input
								bind:value={question.prompt_text}
								class="mt-1 w-full rounded-lg border p-2"
							/></label
						>
						<label class="block text-sm"
							>Stimulus teks<input
								bind:value={question.stimulus_text}
								class="mt-1 w-full rounded-lg border p-2"
							/></label
						>
						<label class="block text-sm"
							>URL media stimulus<input
								value={question.stimulus_media_url ?? ''}
								oninput={(e) => (question.stimulus_media_url = e.currentTarget.value || null)}
								class="mt-1 w-full rounded-lg border p-2"
							/></label
						>
						<div class="grid gap-3 sm:grid-cols-2">
							<label class="block text-sm"
								>Poin<input
									bind:value={question.points}
									type="number"
									min="1"
									class="mt-1 w-full rounded-lg border p-2"
								/></label
							><label class="block text-sm"
								>Penjelasan<input
									bind:value={question.explanation}
									class="mt-1 w-full rounded-lg border p-2"
								/></label
							>
						</div>
						{#if item.skill === 'writing'}<label class="block text-sm"
								>Template kana<select
									bind:value={question.stroke_template_id}
									class="mt-1 w-full rounded-lg border p-2"
									><option value={null}>Pilih template</option>{#each templates as template}<option
											value={String(template.id)}
											>{template.script}
											{template.character} · {template.romaji} ({template.source_version})</option
										>{/each}</select
								></label
							><label class="flex items-center gap-2 text-sm"
								><input type="checkbox" bind:checked={question.show_writing_guide} /> Tampilkan panduan
								goresan</label
							>
						{:else}<div class="space-y-2">
								<p class="text-sm font-medium">Pilihan jawaban</p>
								{#each question.options as option, j}<div
										class="grid gap-2 rounded-lg border bg-white p-2 sm:grid-cols-[auto_1fr_auto]"
									>
										<input
											type="radio"
											name={`correct-${i}`}
											checked={option.is_correct}
											onchange={() =>
												question.options.forEach(
													(entry, index) => (entry.is_correct = index === j)
												)}
											aria-label={`Jawaban benar pilihan ${j + 1}`}
										/>
										<div class="space-y-2">
											<input
												bind:value={option.label}
												class="w-full rounded-lg border p-2"
												placeholder={`Pilihan ${j + 1}`}
											/><input
												type="url"
												value={option.media_url ?? ''}
												oninput={(e) => (option.media_url = e.currentTarget.value || null)}
												class="w-full rounded-lg border p-2"
												placeholder="URL media pilihan (opsional)"
											/>
										</div>
										<button
											type="button"
											class="text-sm text-red-700"
											onclick={() => question.options.splice(j, 1)}>Hapus</button
										>
									</div>{/each}<button
									type="button"
									class="text-sm text-blue-700"
									onclick={() =>
										question.options.push({ label: '', media_url: null, is_correct: false })}
									>Tambah pilihan</button
								>
							</div>{/if}
					</div>{/each}
			</div>
		{/if}
		<button
			type="submit"
			class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
			>Simpan Draft</button
		>
	</form>
	{#if !isNew}<div class="flex flex-wrap gap-3">
			{#if archived}<form method="POST" action="?/restore">
					<button class="rounded-lg border px-4 py-2 text-sm">Pulihkan</button>
				</form>{:else}<form method="POST" action="?/publish">
					<button
						class="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700"
						>{hasDraft ? 'Terbitkan Perubahan' : 'Terbitkan'}</button
					>
				</form>{/if}
			<button
				type="button"
				onclick={() => (confirmDelete = !confirmDelete)}
				class="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700">Hapus</button
			>
			{#if confirmDelete}<form method="POST" action="?/remove">
					<p class="mb-2 text-sm text-red-700">
						Konten dengan riwayat siswa akan diarsipkan. Lanjutkan?
					</p>
					<button class="rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
						>Ya, hapus atau arsipkan</button
					>
				</form>{/if}
		</div>{/if}
</div>
