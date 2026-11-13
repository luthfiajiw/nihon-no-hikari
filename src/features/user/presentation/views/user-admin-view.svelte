<script lang="ts">
	import type { ManagementFormResult } from '$lib/models/management-form.model';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import type { UserAdminData } from '$features/user/presentation/models/user-admin-view.model';
	import {
		DataTable,
		DataTableColumnHeader,
		type DataTableColumn,
		type DataTableColumnDef
	} from '$lib/components/data-table';
	import { renderSnippet } from '@tanstack/svelte-table';
	import type { UserAdminRecord } from '$features/user/domain/entities/user-admin.entity';

	let { data, form }: { data: UserAdminData; form?: ManagementFormResult } = $props();

	const columns: DataTableColumnDef<UserAdminRecord>[] = [
		{
			accessorKey: 'display_name',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Nama' }),
			cell: ({ row }) => renderSnippet(nameCell, { row: row.original })
		},
		{
			accessorKey: 'email',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Email' }),
			cell: ({ row }) => renderSnippet(emailCell, { row: row.original })
		},
		{
			accessorKey: 'role',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Role' }),
			cell: ({ row }) => renderSnippet(roleCell, { row: row.original })
		},
		{
			id: 'actions',
			header: 'Aksi',
			cell: ({ row }) => renderSnippet(actionCell, { row: row.original }),
			enableSorting: false
		}
	];
</script>

{#snippet headerSnippet({
	column,
	title
}: {
	column: DataTableColumn<UserAdminRecord>;
	title: string;
})}
	<DataTableColumnHeader {column} {title} />
{/snippet}

{#snippet nameCell({ row }: { row: UserAdminRecord })}
	<span class="font-medium text-foreground">{row.display_name}</span>
{/snippet}

{#snippet emailCell({ row }: { row: UserAdminRecord })}
	<span class="text-muted-foreground">{row.email}</span>
{/snippet}

{#snippet roleCell({ row }: { row: UserAdminRecord })}
	<span
		class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium {row.role === 'Admin'
			? 'border border-primary/20 bg-primary/10 text-primary'
			: 'border border-border bg-muted text-muted-foreground'}"
	>
		{row.role}
	</span>
{/snippet}

{#snippet actionCell({ row }: { row: UserAdminRecord })}
	{#if row.id === data.user?.id}
		<span class="text-xs font-medium text-muted-foreground">Akun Anda</span>
	{:else}
		<form method="POST" action="?/changeRole" class="flex items-center gap-2">
			<Input type="hidden" name="userId" value={row.id} />
			<Input type="hidden" name="role" value={row.role === 'Admin' ? 'User' : 'Admin'} />
			<Button type="submit" variant="outline" size="sm">
				{row.role === 'Admin' ? 'Jadikan User' : 'Jadikan Admin'}
			</Button>
		</form>
	{/if}
{/snippet}

<svelte:head>
	<title>Kelola Pengguna | Admin - Gakkobit</title>
	<meta name="description" content="Kelola pengguna dan akses admin Gakkobit." />
</svelte:head>

<div class="admin-page">
	<ManagementPageHeader
		title="Kelola Pengguna"
		description="Atur akses User dan Admin untuk akun yang sudah terdaftar."
	/>
	{#if form?.message}
		<p class="admin-notice" role="status">{form.message}</p>
	{/if}

	<DataTable
		data={data.users}
		{columns}
		meta={data.meta}
		searchPlaceholder="Cari pengguna (nama atau email)..."
		emptyMessage="Tidak ada pengguna yang ditemukan."
	/>
</div>
