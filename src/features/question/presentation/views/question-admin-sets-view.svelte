<script lang="ts">
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Plus, ArrowUpRight, BookOpen, PenLine } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import ManagementSelect from '$lib/components/management-select.svelte';
	import StatusBadge from '$lib/components/content-status-badge.svelte';
	import type { QuestionAdminSetsData } from '$features/question/presentation/models/question-admin-view.model';
	import { DataTable, DataTableColumnHeader } from '$lib/components/data-table';
	import { renderSnippet, type ColumnDef } from '@tanstack/svelte-table';
	import type { QuestionAdminRecord } from '$features/question/domain/entities/question-admin.entity';

	let { data }: { data: QuestionAdminSetsData } = $props();

	let currentSkill = $derived(page.url.searchParams.get('skill') ?? 'all');
	let currentStatus = $derived(page.url.searchParams.get('status') ?? 'all');

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

	function updateFilter(key: 'skill' | 'status', value: string) {
		const url = new URL(page.url);
		if (value === 'all') {
			url.searchParams.delete(key);
		} else {
			url.searchParams.set(key, value);
		}
		url.searchParams.delete('page');
		goto(url.toString(), { keepFocus: true, noScroll: true, replaceState: true });
	}

	const columns: ColumnDef<any, QuestionAdminRecord, any>[] = [
		{
			accessorKey: 'title',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Question Set' }),
			cell: ({ row }) => renderSnippet(titleCell, { row: row.original })
		},
		{
			accessorKey: 'skill',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Skill' }),
			cell: ({ row }) => renderSnippet(skillCell, { row: row.original })
		},
		{
			id: 'status',
			header: 'Status',
			cell: ({ row }) => renderSnippet(statusCell, { row: row.original }),
			enableSorting: false
		},
		{
			accessorKey: 'version',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Versi' }),
			cell: ({ row }) => renderSnippet(versionCell, { row: row.original })
		},
		{
			id: 'actions',
			header: () => renderSnippet(actionsHeaderSnippet, {}),
			cell: ({ row }) => renderSnippet(actionsCell, { row: row.original }),
			enableSorting: false
		}
	];
</script>

{#snippet headerSnippet({ column, title }: { column: any; title: string })}
	<DataTableColumnHeader {column} {title} />
{/snippet}

{#snippet actionsHeaderSnippet()}
	<div class="text-right">Aksi</div>
{/snippet}

{#snippet titleCell({ row }: { row: QuestionAdminRecord })}
	<button
		type="button"
		class="group flex w-full items-center gap-3 text-left transition-colors"
		onclick={() => goto(resolve(`/admin/content/question_set/${row.id}` as Pathname))}
	>
		<div
			class="flex size-9 shrink-0 items-center justify-center rounded-lg {row.skill === 'writing'
				? 'bg-rose-50 text-rose-500'
				: 'bg-primary/10 text-primary'}"
		>
			{#if row.skill === 'writing'}
				<PenLine class="size-4" />
			{:else}
				<BookOpen class="size-4" />
			{/if}
		</div>
		<div class="min-w-0 flex-1">
			<span class="block truncate text-sm font-semibold text-foreground group-hover:text-primary">
				{row.title}
			</span>
			<span class="block text-xs text-muted-foreground">
				{row.kind === 'final_exam' ? 'Ujian module' : 'Latihan lesson'}
			</span>
		</div>
	</button>
{/snippet}

{#snippet skillCell({ row }: { row: QuestionAdminRecord })}
	<span class="capitalize text-sm font-medium text-muted-foreground">
		{row.skill === 'writing' ? 'Writing' : row.skill === 'reading' ? 'Reading' : 'Gabungan'}
	</span>
{/snippet}

{#snippet statusCell({ row }: { row: QuestionAdminRecord })}
	<StatusBadge item={row} />
{/snippet}

{#snippet versionCell({ row }: { row: QuestionAdminRecord })}
	<span class="text-xs text-muted-foreground">
		v{row.version ?? 1}
	</span>
{/snippet}

{#snippet actionsCell({ row }: { row: QuestionAdminRecord })}
	<div class="flex justify-end">
		<Button
			variant="ghost"
			size="icon"
			class="size-8"
			onclick={() => goto(resolve(`/admin/content/question_set/${row.id}` as Pathname))}
		>
			<ArrowUpRight class="size-4 text-muted-foreground" />
			<span class="sr-only">Buka</span>
		</Button>
	</div>
{/snippet}

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
		<div class="flex items-center gap-2">
			<span class="text-xs font-medium text-muted-foreground">Filter Skill:</span>
			<ManagementSelect
				value={currentSkill}
				options={skillOptions}
				aria-label="Filter skill"
				class="h-9 bg-background text-muted-foreground sm:w-40"
				onchange={(val: string) => updateFilter('skill', val)}
			/>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-xs font-medium text-muted-foreground">Filter Status:</span>
			<ManagementSelect
				value={currentStatus}
				options={statusOptions}
				aria-label="Filter status"
				class="h-9 bg-background text-muted-foreground sm:w-40"
				onchange={(val: string) => updateFilter('status', val)}
			/>
		</div>
	</Card.Root>

	<DataTable
		data={data.sets}
		{columns}
		meta={data.meta}
		searchPlaceholder="Cari question set..."
		emptyMessage="Tidak ada question set yang ditemukan."
	/>
</div>
