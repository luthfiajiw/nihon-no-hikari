import { renderComponent } from '@tanstack/svelte-table';
import StatusBadge from '$lib/components/content-status-badge.svelte';
import { DataTableColumnHeader, type DataTableColumnDef } from '$lib/components/data-table';
import type { CourseAdminRecord } from '$features/course/domain/entities/course-admin.entity';
import CourseAdminCoursesCells from './course-admin-courses-cells.svelte';

export function createCourseAdminCoursesColumns(
	onDelete: (course: CourseAdminRecord) => void
): DataTableColumnDef<CourseAdminRecord>[] {
	return [
		{
			accessorKey: 'title',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Kursus' }),
			cell: ({ row }) =>
				renderComponent(CourseAdminCoursesCells, { cell: 'title', row: row.original })
		},
		{
			accessorKey: 'level_code',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Level' }),
			cell: ({ row }) =>
				renderComponent(CourseAdminCoursesCells, { cell: 'level', row: row.original })
		},
		{
			accessorKey: 'module_count',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Materi' }),
			cell: ({ row }) =>
				renderComponent(CourseAdminCoursesCells, { cell: 'counts', row: row.original })
		},
		{
			accessorKey: 'order_index',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Urutan' }),
			cell: ({ row }) =>
				renderComponent(CourseAdminCoursesCells, { cell: 'order', row: row.original })
		},
		{
			id: 'status',
			accessorFn: (row) =>
				row.archived_at ? 'archived' : row.is_published ? 'published' : 'draft',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Status' }),
			cell: ({ row }) => renderComponent(StatusBadge, { item: row.original })
		},
		{
			id: 'actions',
			header: () => renderComponent(CourseAdminCoursesCells, { cell: 'actions-header' }),
			cell: ({ row }) =>
				renderComponent(CourseAdminCoursesCells, {
					cell: 'actions',
					row: row.original,
					onDelete
				}),
			enableSorting: false
		}
	];
}
