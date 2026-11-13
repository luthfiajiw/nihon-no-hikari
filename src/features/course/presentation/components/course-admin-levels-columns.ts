import { renderComponent } from '@tanstack/svelte-table';
import { DataTableColumnHeader, type DataTableColumnDef } from '$lib/components/data-table';
import type { CourseAdminLevel } from '$features/course/domain/entities/course-admin.entity';
import CourseAdminLevelsCells from './course-admin-levels-cells.svelte';

export const courseAdminLevelsColumns: DataTableColumnDef<CourseAdminLevel>[] = [
	{
		accessorKey: 'code',
		header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Level' }),
		cell: ({ row }) => renderComponent(CourseAdminLevelsCells, { cell: 'code', row: row.original })
	},
	{
		accessorKey: 'name',
		header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Nama' }),
		cell: ({ row }) => renderComponent(CourseAdminLevelsCells, { cell: 'name', row: row.original })
	},
	{
		accessorKey: 'description',
		header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Deskripsi' }),
		cell: ({ row }) =>
			renderComponent(CourseAdminLevelsCells, { cell: 'description', row: row.original })
	},
	{
		accessorKey: 'price',
		header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Harga' }),
		cell: ({ row }) => renderComponent(CourseAdminLevelsCells, { cell: 'price', row: row.original })
	},
	{
		id: 'points',
		header: 'Poin Kartu',
		cell: ({ row }) =>
			renderComponent(CourseAdminLevelsCells, { cell: 'points', row: row.original }),
		enableSorting: false
	},
	{
		accessorKey: 'order_index',
		header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Urutan' }),
		cell: ({ row }) => renderComponent(CourseAdminLevelsCells, { cell: 'order', row: row.original })
	},
	{
		id: 'actions',
		header: () => renderComponent(CourseAdminLevelsCells, { cell: 'actions-header' }),
		cell: ({ row }) =>
			renderComponent(CourseAdminLevelsCells, { cell: 'actions', row: row.original }),
		enableSorting: false
	}
];
