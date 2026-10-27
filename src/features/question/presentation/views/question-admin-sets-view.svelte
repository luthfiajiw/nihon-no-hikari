<script lang="ts">
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ClipboardCheck, Plus, Search, ArrowUpRight, BookOpen, PenLine } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import ManagementSelect from '$lib/components/management-select.svelte';
	import StatusBadge from '$lib/components/content-status-badge.svelte';
	import { matchesContent } from '$lib/content-status';
	import type { QuestionAdminSetsData } from '$features/question/presentation/models/question-admin-view.model';
	let { data }: { data: QuestionAdminSetsData } = $props();
	let search = $derived(page.url.searchParams.get('q') ?? '');
	let status = $state('all');
	let skill = $state('all');
	const skillOptions = [
		{ value: 'all', label: 'Semua skill' },
		{ value: 'reading', label: 'Reading' },
		{ value: 'writing', label: 'Writing' }
	];
	const statusOptions = [
		{ value: 'all', label: 'Semua status' },
		{ value: 'published', label: 'Terbit' },
		{ value: 'draft', label: 'Draft' },
		{ value: 'archived', label: 'Arsip' }
	];
	const sets = $derived(
		data.sets.filter(
			(set) => matchesContent(set, search, status) && (skill === 'all' || set.skill === skill)
		)
	);
</script>

<svelte:head>
	<title>Question Sets | Admin - Gakkobit</title>
	<meta name="description" content="Kelola latihan dan ujian Gakkobit." />
</svelte:head>

<div class="admin-page">
	<ManagementPageHeader
		title="Question Sets"
		description="Kelola latihan lesson dan ujian akhir module."
	>
		{#snippet actions()}
			<Button onclick={() => goto(resolve('/admin/content/question_set/new'))} class="px-4">
				<Plus class="size-4" /> Buat Question Set
			</Button>
		{/snippet}
	</ManagementPageHeader>
	<Card.Root size="sm" class="flex-row flex-wrap items-center gap-4 px-(--card-spacing)">
		<div class="relative min-w-48 flex-1">
			<Search class="absolute top-2.5 left-3 size-4 text-muted-foreground/70" />
			<Input
				bind:value={search}
				aria-label="Cari question set"
				placeholder="Cari question set..."
				class="h-9 pl-9"
			/>
		</div>
		<ManagementSelect
			bind:value={skill}
			options={skillOptions}
			aria-label="Filter skill"
			class="h-9 bg-background text-muted-foreground sm:w-40"
		/>
		<ManagementSelect
			bind:value={status}
			options={statusOptions}
			aria-label="Filter status"
			class="h-9 bg-background text-muted-foreground sm:w-40"
		/>
	</Card.Root>
	<Card.Root class="gap-0 py-0">
		<div
			class="admin-row flex justify-between border-b bg-muted/70 text-xs font-medium text-muted-foreground"
		>
			<span>{sets.length} question set</span>
			<span>Kelola soal & pengaturan</span>
		</div>
		{#each sets as set (set.id)}
			<button
				type="button"
				onclick={() => goto(resolve(`/admin/content/question_set/${set.id}` as Pathname))}
				class="group admin-row flex w-full items-center gap-4 border-b border-border text-left transition-colors last:border-0 hover:bg-sky-50/40 dark:hover:bg-sky-950/40"
			>
				<div
					class="flex size-11 shrink-0 items-center justify-center rounded-xl {set.skill ===
					'writing'
						? 'bg-rose-50 text-rose-500'
						: 'bg-sky-50 text-sky-500'}"
				>
					{#if set.skill === 'writing'}
						<PenLine class="size-5" />
					{:else}
						<BookOpen class="size-5" />
					{/if}
				</div>
				<div class="min-w-0 flex-1">
					<h2 class="truncate text-sm font-semibold text-foreground group-hover:text-sky-600">
						{set.title}
					</h2>
					<p class="mt-1 text-xs text-muted-foreground">
						{set.kind === 'final_exam' ? 'Ujian module' : 'Latihan lesson'} · {set.skill ===
						'writing'
							? 'Writing'
							: set.skill === 'reading'
								? 'Reading'
								: 'Gabungan'} · Versi {set.version ?? 1}
					</p>
				</div>
				<StatusBadge item={set} />
				<ArrowUpRight class="size-4 shrink-0 text-muted-foreground/70 group-hover:text-sky-600" />
			</button>
		{:else}
			<div class="admin-empty">
				<ClipboardCheck class="mx-auto mb-4 size-10 text-muted-foreground/50" />
				<h2 class="font-semibold">
					{data.sets.length ? 'Question set tidak ditemukan' : 'Belum ada question set'}
				</h2>
				<p class="mt-2 text-sm text-muted-foreground">
					{data.sets.length
						? 'Coba kata kunci atau filter lainnya.'
						: 'Buat latihan reading atau writing untuk mulai menyusun soal.'}
				</p>
			</div>
		{/each}
	</Card.Root>
</div>
