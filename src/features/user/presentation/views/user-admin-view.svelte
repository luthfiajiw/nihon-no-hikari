<script lang="ts">
	import type { ManagementFormResult } from '$lib/models/management-form.model';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import type { UserAdminData } from '$features/user/presentation/models/user-admin-view.model';
	import { DataTable } from '$lib/components/data-table';
	import { createUserAdminColumns } from '$features/user/presentation/components/user-admin-columns';

	let { data, form }: { data: UserAdminData; form?: ManagementFormResult } = $props();

	const columns = $derived(createUserAdminColumns(data.user?.id));
</script>

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
