<script lang="ts">
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import type { ResolvedPathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import ManagementSelect from '$lib/components/management-select.svelte';
	import type { QuestionAdminSetsData } from '$features/question/presentation/models/question-admin-view.model';
	import { DataTable } from '$lib/components/data-table';
	import { questionAdminSetsColumns as columns } from '$features/question/presentation/components/question-admin-sets-columns';

	let { data }: { data: QuestionAdminSetsData } = $props();

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
