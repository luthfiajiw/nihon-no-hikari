<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Pencil, Plus } from 'lucide-svelte';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import ManagementSelect from '$lib/components/management-select.svelte';
	import type { QuestionKanaTemplatesData } from '$features/question/presentation/models/question-admin-view.model';
	import type { QuestionKanaTemplateMetadata } from '$features/question/domain/entities/question-kana-template.entity';
	import { DataTable, DataTableColumnHeader } from '$lib/components/data-table';
	import { renderSnippet, type ColumnDef } from '@tanstack/svelte-table';

	let { data }: { data: QuestionKanaTemplatesData } = $props();

	let script = $state('all');

	const filteredTemplates = $derived(
		data.templates.filter((item) => script === 'all' || item.script === script)
	);

	const columns: ColumnDef<any, QuestionKanaTemplateMetadata, any>[] = [
		{
			accessorKey: 'character',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Karakter' }),
			cell: ({ row }) => renderSnippet(characterCell, { row: row.original })
		},
		{
			accessorKey: 'script',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Script' }),
			cell: ({ row }) => renderSnippet(scriptCell, { row: row.original })
		},
		{
			accessorKey: 'romaji',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Romaji' })
		},
		{
			accessorKey: 'source_version',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Versi sumber' })
		},
		{
			accessorKey: 'stroke_count',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Goresan' })
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

{#snippet characterCell({ row }: { row: QuestionKanaTemplateMetadata })}
	<span class="text-3xl font-medium">{row.character}</span>
{/snippet}

{#snippet scriptCell({ row }: { row: QuestionKanaTemplateMetadata })}
	<span class="capitalize">{row.script}</span>
{/snippet}

{#snippet actionsCell({ row }: { row: QuestionKanaTemplateMetadata })}
	<div class="flex justify-end">
		<Button
			variant="outline"
			size="icon"
			aria-label={`Edit template ${row.character} ${row.source_version}`}
			onclick={() =>
				goto(resolve('/(protected)/admin/kana-templates/[id]', { id: row.id }))}
		>
			<Pencil class="size-4" />
		</Button>
	</div>
{/snippet}

<svelte:head>
	<title>Template Kana | Admin - Gakkobit</title>
	<meta name="description" content="Kelola panduan goresan hiragana dan katakana dari KanjiVG." />
</svelte:head>

<div class="admin-page">
	<ManagementPageHeader
		title="Template Kana"
		description="Panduan goresan hiragana dan katakana untuk latihan menulis."
	>
		{#snippet actions()}
			<Button
				onclick={() => goto(resolve('/(protected)/admin/kana-templates/[id]', { id: 'new' }))}
			>
				<Plus class="size-4" /> Tambah Template
			</Button>
		{/snippet}
	</ManagementPageHeader>

	<Card.Root size="sm" class="px-(--card-spacing)">
		<div class="admin-fields">
			<div class="flex flex-col space-y-1 text-sm font-medium">
				<label for="kana-script-filter">Filter</label>
				<ManagementSelect
					id="kana-script-filter"
					bind:value={script}
					options={[
						{ value: 'all', label: 'Semua script' },
						{ value: 'hiragana', label: 'Hiragana' },
						{ value: 'katakana', label: 'Katakana' }
					]}
				/>
			</div>
		</div>
	</Card.Root>

	<DataTable
		data={filteredTemplates}
		{columns}
		meta={data.meta}
		searchPlaceholder="Cari template kana..."
		emptyMessage={data.templates.length
			? 'Template tidak ditemukan.'
			: 'Belum ada template kana. Tambahkan SVG KanjiVG untuk mulai.'}
	/>
</div>
