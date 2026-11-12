<script lang="ts">
	import type { ManagementFormResult } from '$lib/models/management-form.model';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import { Plus, Pencil } from 'lucide-svelte';
	import type { CourseAdminLevelsData } from '$features/course/presentation/models/course-admin-view.model';
	import { DataTable, DataTableColumnHeader } from '$lib/components/data-table';
	import { renderSnippet, type ColumnDef } from '@tanstack/svelte-table';
	import type { CourseAdminLevel } from '$features/course/domain/entities/course-admin.entity';

	let { data, form }: { data: CourseAdminLevelsData; form?: ManagementFormResult } = $props();

	function formatRupiah(value: number): string {
		if (value === 0) return 'Gratis';
		return 'Rp ' + new Intl.NumberFormat('id-ID').format(value);
	}

	const columns: ColumnDef<any, CourseAdminLevel, any>[] = [
		{
			accessorKey: 'code',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Level' }),
			cell: ({ row }) => renderSnippet(codeCell, { row: row.original })
		},
		{
			accessorKey: 'name',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Nama' }),
			cell: ({ row }) => renderSnippet(nameCell, { row: row.original })
		},
		{
			accessorKey: 'description',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Deskripsi' }),
			cell: ({ row }) => renderSnippet(descriptionCell, { row: row.original })
		},
		{
			accessorKey: 'price',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Harga' }),
			cell: ({ row }) => renderSnippet(priceCell, { row: row.original })
		},
		{
			id: 'points',
			header: 'Poin Kartu',
			cell: ({ row }) => renderSnippet(pointsCell, { row: row.original }),
			enableSorting: false
		},
		{
			accessorKey: 'order_index',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Urutan' }),
			cell: ({ row }) => renderSnippet(orderCell, { row: row.original })
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

{#snippet codeCell({ row }: { row: CourseAdminLevel })}
	<span
		class="inline-flex items-center justify-center rounded-lg bg-surface-container-highest px-2.5 py-1 text-xs font-bold text-on-surface"
	>
		{row.code}
	</span>
{/snippet}

{#snippet nameCell({ row }: { row: CourseAdminLevel })}
	<span class="font-medium text-foreground">{row.name}</span>
{/snippet}

{#snippet descriptionCell({ row }: { row: CourseAdminLevel })}
	<span class="max-w-xs truncate text-muted-foreground block">
		{row.description || '-'}
	</span>
{/snippet}

{#snippet priceCell({ row }: { row: CourseAdminLevel })}
	<span class="font-semibold text-foreground">
		{formatRupiah(row.price)}
	</span>
{/snippet}

{#snippet pointsCell({ row }: { row: CourseAdminLevel })}
	<span class="text-muted-foreground">
		{row.points?.length ?? 0} poin
	</span>
{/snippet}

{#snippet orderCell({ row }: { row: CourseAdminLevel })}
	<span class="text-muted-foreground">
		{row.order_index}
	</span>
{/snippet}

{#snippet actionsCell({ row }: { row: CourseAdminLevel })}
	<div class="flex justify-end">
		<Button
			variant="outline"
			size="sm"
			class="gap-1.5"
			aria-label={`Edit ${row.code}`}
			onclick={() => goto(resolve('/(protected)/admin/levels/[id]', { id: row.id }))}
		>
			<Pencil class="size-3.5" /> Edit
		</Button>
	</div>
{/snippet}

<svelte:head>
	<title>Level & Harga | Admin - Gakkobit</title>
	<meta name="description" content="Atur harga paket sekali bayar untuk setiap level JLPT (N5–N1)." />
</svelte:head>

<div class="admin-page">
	<ManagementPageHeader
		title="Level & Harga"
		description="Atur harga paket sekali bayar dan poin manfaat untuk setiap level JLPT (N5–N1)."
	>
		{#snippet actions()}
			<Button
				onclick={() => goto(resolve('/(protected)/admin/levels/[id]', { id: 'new' }))}
				class="gap-2 px-4"
			>
				<Plus class="size-4" /> Buat Level
			</Button>
		{/snippet}
	</ManagementPageHeader>
	{#if form?.message}
		<p class="admin-notice" role="status">{form.message}</p>
	{/if}

	<DataTable
		data={data.levels}
		{columns}
		meta={data.meta}
		searchPlaceholder="Cari level (kode, nama, deskripsi)..."
		emptyMessage="Tidak ada level yang ditemukan."
	/>
</div>
