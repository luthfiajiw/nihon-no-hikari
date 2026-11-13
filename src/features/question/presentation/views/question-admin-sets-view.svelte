<script lang="ts">
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import type { ResolvedPathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { manageQuestionAdminContentUseCase } from '$dependencies/question.dependency';
	import type { QuestionAdminRecord } from '$features/question/domain/entities/question-admin.entity';
	import { HttpError } from '$lib/http/http-error';
	import { Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import ManagementSelect from '$lib/components/management-select.svelte';
	import type { QuestionAdminSetsData } from '$features/question/presentation/models/question-admin-view.model';
	import { DataTable } from '$lib/components/data-table';
	import { createQuestionAdminSetsColumns } from '$features/question/presentation/components/question-admin-sets-columns';

	let { data }: { data: QuestionAdminSetsData } = $props();

	let busy = $state(false);
	let message = $state('');
	let notice = $state('');
	let deleting = $state<QuestionAdminRecord | null>(null);
	let deleteOpen = $state(false);

	async function removeQuestionSet() {
		if (!deleting || busy) return;
		busy = true;
		message = '';
		notice = '';
		try {
			await manageQuestionAdminContentUseCase.exec('remove', deleting.id);
			notice = `Question set “${deleting.title}” berhasil dihapus.`;
			deleteOpen = false;
			deleting = null;
			await invalidate('question:sets');
		} catch (cause) {
			message = cause instanceof Error ? cause.message : 'Gagal menghapus question set.';
			deleteOpen = false;
			deleting = null;
			if (cause instanceof HttpError && cause.status === 401) await goto(resolve('/signin'));
		} finally {
			busy = false;
		}
	}

	const columns = createQuestionAdminSetsColumns((set) => {
		deleting = set;
		deleteOpen = true;
	});

	let currentSkill = $derived(page.url.searchParams.get('skill') ?? 'all');
	let currentKind = $derived(page.url.searchParams.get('kind') ?? 'all');
	let currentStatus = $derived(page.url.searchParams.get('status') ?? 'all');

	const skillOptions = [
		{ value: 'all', label: 'Semua skill' },
		{ value: 'reading', label: 'Reading' },
		{ value: 'writing', label: 'Writing' }
	];
	const kindOptions = [
		{ value: 'all', label: 'Semua jenis' },
		{ value: 'practice', label: 'Latihan lesson' },
		{ value: 'final_exam', label: 'Ujian module' }
	];
	const statusOptions = [
		{ value: 'all', label: 'Semua status' },
		{ value: 'published', label: 'Terbit' },
		{ value: 'draft', label: 'Draft' },
		{ value: 'archived', label: 'Arsip' }
	];

	function updateFilter(key: 'skill' | 'kind' | 'status', value: string) {
		const url = new URL(page.url);
		if (value === 'all') {
			url.searchParams.delete(key);
		} else {
			url.searchParams.set(key, value);
		}
		url.searchParams.delete('page');
		goto(`${resolve('/(protected)/admin/question-sets')}${url.search}` as ResolvedPathname, {
			keepFocus: true,
			noScroll: true,
			replaceState: true
		});
	}
</script>

<svelte:head>
	<title>Question Sets | Admin - Gakkobit</title>
	<meta name="description" content="Kelola latihan dan ujian Gakkobit." />
</svelte:head>

<div class="flex flex-col space-y-6">
	<ManagementPageHeader
		title="Question Sets"
		description="Kelola latihan lesson dan ujian akhir module."
	/>

	{#if message}
		<p class="admin-notice border-destructive text-destructive" role="alert">
			{message}
		</p>
	{/if}
	{#if notice}
		<p
			class="admin-notice border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
			role="status"
		>
			{notice}
		</p>
	{/if}

	<DataTable
		data={data.sets}
		{columns}
		meta={data.meta}
		searchPlaceholder="Cari question set..."
		emptyMessage="Tidak ada question set yang ditemukan."
	>
		{#snippet headerActions()}
			<div class="flex w-full items-center justify-between">
				<div class="flex items-center gap-2">
					<ManagementSelect
						value={currentSkill}
						options={skillOptions}
						aria-label="Filter skill"
						class="h-9 bg-background text-muted-foreground sm:w-40"
						onchange={(val: string) => updateFilter('skill', val)}
					/>
					<ManagementSelect
						value={currentKind}
						options={kindOptions}
						aria-label="Filter jenis"
						class="h-9 bg-background text-muted-foreground sm:w-40"
						onchange={(val: string) => updateFilter('kind', val)}
					/>
					<ManagementSelect
						value={currentStatus}
						options={statusOptions}
						aria-label="Filter status"
						class="h-9 bg-background text-muted-foreground sm:w-40"
						onchange={(val: string) => updateFilter('status', val)}
					/>
				</div>

				<Button onclick={() => goto(resolve('/admin/content/question_set/new'))} class="px-4">
					<Plus class="size-4" /> Buat Question Set
				</Button>
			</div>
		{/snippet}
	</DataTable>
</div>

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Hapus question set?</Dialog.Title>
			<Dialog.Description>
				Question set “{deleting?.title}” akan dihapus atau diarsipkan jika sudah memiliki riwayat
				siswa.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" disabled={busy} onclick={() => (deleteOpen = false)}>Batal</Button>
			<Button variant="destructive" disabled={busy} onclick={removeQuestionSet}>
				{busy ? 'Menghapus...' : 'Hapus Question Set'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
