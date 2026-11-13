<script lang="ts">
	import type { ResolvedPathname } from '$app/types';
	import { goto, invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { deleteUserAdminUseCase } from '$dependencies/user.dependency';
	import type { UserAdminRecord } from '$features/user/domain/entities/user-admin.entity';
	import { HttpError } from '$lib/http/http-error';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { ManagementFormResult } from '$lib/models/management-form.model';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import ManagementSelect from '$lib/components/management-select.svelte';
	import type { UserAdminData } from '$features/user/presentation/models/user-admin-view.model';
	import { DataTable } from '$lib/components/data-table';
	import { createUserAdminColumns } from '$features/user/presentation/components/user-admin-columns';

	let { data, form }: { data: UserAdminData; form?: ManagementFormResult } = $props();

	let busy = $state(false);
	let message = $state('');
	let notice = $state('');
	let deleting = $state<UserAdminRecord | null>(null);
	let deleteOpen = $state(false);

	async function removeUser() {
		if (!deleting || busy) return;
		busy = true;
		message = '';
		notice = '';
		try {
			await deleteUserAdminUseCase.exec(deleting.id);
			notice = `Pengguna “${deleting.display_name}” berhasil dihapus.`;
			deleteOpen = false;
			deleting = null;
			await invalidate('user:admin-list');
		} catch (cause) {
			message = cause instanceof Error ? cause.message : 'Gagal menghapus pengguna.';
			deleteOpen = false;
			deleting = null;
			if (cause instanceof HttpError && cause.status === 401) await goto(resolve('/signin'));
		} finally {
			busy = false;
		}
	}

	const columns = $derived(
		createUserAdminColumns(data.user?.id, (user) => {
			deleting = user;
			deleteOpen = true;
		})
	);
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
	{#if message}
		<p class="admin-notice border-destructive text-destructive" role="alert">
			{message}
		</p>
	{/if}
	{#if notice}
		<p
			class="admin-notice border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
			role="status"
		>
			{notice}
		</p>
	{:else if form?.message}
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

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Hapus pengguna?</Dialog.Title>
			<Dialog.Description>
				Akun pengguna “{deleting?.display_name}” ({deleting?.email}) akan dihapus.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" disabled={busy} onclick={() => (deleteOpen = false)}>Batal</Button>
			<Button variant="destructive" disabled={busy} onclick={removeUser}>
				{busy ? 'Menghapus...' : 'Hapus Pengguna'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
