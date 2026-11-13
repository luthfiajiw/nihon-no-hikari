import { renderComponent } from '@tanstack/svelte-table';
import { DataTableColumnHeader, type DataTableColumnDef } from '$lib/components/data-table';
import type { KotobaAdminTopic } from '$features/kotoba/presentation/models/kotoba-admin.model';
import KotobaAdminCells from './kotoba-admin-cells.svelte';

export function createKotobaAdminColumns(
	onDelete: (topic: KotobaAdminTopic) => void
): DataTableColumnDef<KotobaAdminTopic>[] {
	return [
		{
			accessorKey: 'title',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Topik' }),
			cell: ({ row }) => renderComponent(KotobaAdminCells, { cell: 'title', row: row.original })
		},
		{
			accessorKey: 'level',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Level' }),
			cell: ({ row }) => renderComponent(KotobaAdminCells, { cell: 'level', row: row.original })
		},
		{
			accessorKey: 'vocabularyCount',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Kosakata' }),
			cell: ({ row }) => renderComponent(KotobaAdminCells, { cell: 'vocab', row: row.original })
		},
		{
			accessorKey: 'order',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Urutan' }),
			cell: ({ row }) => renderComponent(KotobaAdminCells, { cell: 'order', row: row.original })
		},
		{
			accessorKey: 'active',
			header: 'Status',
			cell: ({ row }) => renderComponent(KotobaAdminCells, { cell: 'status', row: row.original }),
			enableSorting: false
		},
		{
			id: 'actions',
			header: () => renderComponent(KotobaAdminCells, { cell: 'actions-header' }),
			cell: ({ row }) =>
				renderComponent(KotobaAdminCells, {
					cell: 'actions',
					row: row.original,
					onDelete
				}),
			enableSorting: false
		}
	];
}
