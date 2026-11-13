<script lang="ts">
	import type { ResolvedPathname } from '$app/types';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { ManagementFormResult } from '$lib/models/management-form.model';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import ManagementSelect from '$lib/components/management-select.svelte';
	import type { UserAdminData } from '$features/user/presentation/models/user-admin-view.model';
	import { DataTable } from '$lib/components/data-table';
	import { createUserAdminColumns } from '$features/user/presentation/components/user-admin-columns';

	let { data, form }: { data: UserAdminData; form?: ManagementFormResult } = $props();

	const columns = $derived(createUserAdminColumns(data.user?.id));
	const currentRole = $derived(page.url.searchParams.get('role') ?? 'all');

	const roleOptions = [
		{ value: 'all', label: 'Semua role' },
		{ value: 'Admin', label: 'Admin' },
		{ value: 'User', label: 'User' }
	];

	function updateFilter(key: 'role', val: string) {
		const url = new URL(page.url);
		if (val === 'all') {
			url.searchParams.delete(key);
		} else {
			url.searchParams.set(key, val);
		}
		url.searchParams.delete('page');
		goto(`${resolve('/(protected)/admin/users')}${url.search}` as ResolvedPathname, {
			keepFocus: true,
			noScroll: true,
			replaceState: true
		});
	}
</script>

<svelte:head>
	<title>Kelola Pengguna | Admin - Gakkobit</title>
	<meta name="description" content="Kelola pengguna dan akses admin Gakkobit." />
</svelte:head>

<div class="flex flex-col space-y-6">
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
	>
		{#snippet headerActions()}
			<div class="flex items-center gap-2">
				<ManagementSelect
					aria-label="Filter role"
					value={currentRole}
					options={roleOptions}
					class="h-9 bg-background text-muted-foreground sm:w-36"
					onchange={(val: string) => updateFilter('role', val)}
				/>
			</div>
		{/snippet}
	</DataTable>
</div>
