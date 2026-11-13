import { renderComponent } from '@tanstack/svelte-table';
import StatusBadge from '$lib/components/content-status-badge.svelte';
import { DataTableColumnHeader, type DataTableColumnDef } from '$lib/components/data-table';
import type { QuestionAdminRecord } from '$features/question/domain/entities/question-admin.entity';
import QuestionAdminSetsCells from './question-admin-sets-cells.svelte';

export const questionAdminSetsColumns: DataTableColumnDef<QuestionAdminRecord>[] = [
	{
		accessorKey: 'title',
		header: ({ column }) =>
			renderComponent(DataTableColumnHeader, { column, title: 'Question Set' }),
		cell: ({ row }) => renderComponent(QuestionAdminSetsCells, { cell: 'title', row: row.original })
	},
	{
		accessorKey: 'skill',
		header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Skill' }),
		cell: ({ row }) => renderComponent(QuestionAdminSetsCells, { cell: 'skill', row: row.original })
	},
	{
		id: 'status',
		header: 'Status',
		cell: ({ row }) => renderComponent(StatusBadge, { item: row.original }),
		enableSorting: false
	},
	{
		accessorKey: 'version',
		header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Versi' }),
		cell: ({ row }) =>
			renderComponent(QuestionAdminSetsCells, { cell: 'version', row: row.original })
	},
	{
		id: 'actions',
		header: () => renderComponent(QuestionAdminSetsCells, { cell: 'actions-header' }),
		cell: ({ row }) =>
			renderComponent(QuestionAdminSetsCells, { cell: 'actions', row: row.original }),
		enableSorting: false
	}
];
