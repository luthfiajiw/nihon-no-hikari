import { renderComponent } from '@tanstack/svelte-table';
import { DataTableColumnHeader, type DataTableColumnDef } from '$lib/components/data-table';
import type { QuestionKanaTemplateMetadata } from '$features/question/domain/entities/question-kana-template.entity';
import QuestionAdminKanaTemplatesCells from './question-admin-kana-templates-cells.svelte';

export const questionAdminKanaTemplatesColumns: DataTableColumnDef<QuestionKanaTemplateMetadata>[] =
	[
		{
			accessorKey: 'character',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Karakter' }),
			cell: ({ row }) =>
				renderComponent(QuestionAdminKanaTemplatesCells, {
					cell: 'character',
					row: row.original
				})
		},
		{
			accessorKey: 'script',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Script' }),
			cell: ({ row }) =>
				renderComponent(QuestionAdminKanaTemplatesCells, { cell: 'script', row: row.original })
		},
		{
			accessorKey: 'romaji',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Romaji' })
		},
		{
			accessorKey: 'source_version',
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, { column, title: 'Versi sumber' })
		},
		{
			accessorKey: 'stroke_count',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Goresan' })
		},
		{
			id: 'actions',
			header: () => renderComponent(QuestionAdminKanaTemplatesCells, { cell: 'actions-header' }),
			cell: ({ row }) =>
				renderComponent(QuestionAdminKanaTemplatesCells, { cell: 'actions', row: row.original }),
			enableSorting: false
		}
	];
