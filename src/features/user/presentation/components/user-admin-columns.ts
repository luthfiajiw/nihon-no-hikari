import { renderComponent } from '@tanstack/svelte-table';
import { DataTableColumnHeader, type DataTableColumnDef } from '$lib/components/data-table';
import type { UserAdminRecord } from '$features/user/domain/entities/user-admin.entity';
import UserAdminCells from './user-admin-cells.svelte';

export function createUserAdminColumns(
	currentUserId?: string
): DataTableColumnDef<UserAdminRecord>[] {
	return [
		{
			accessorKey: 'display_name',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Nama' }),
			cell: ({ row }) => renderComponent(UserAdminCells, { cell: 'name', row: row.original })
		},
		{
			accessorKey: 'email',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Email' }),
			cell: ({ row }) => renderComponent(UserAdminCells, { cell: 'email', row: row.original })
		},
		{
			accessorKey: 'role',
			header: ({ column }) => renderComponent(DataTableColumnHeader, { column, title: 'Role' }),
			cell: ({ row }) => renderComponent(UserAdminCells, { cell: 'role', row: row.original })
		},
		{
			id: 'actions',
			header: 'Aksi',
			cell: ({ row }) =>
				renderComponent(UserAdminCells, {
					cell: 'actions',
					row: row.original,
					currentUserId
				}),
			enableSorting: false
		}
	];
}
