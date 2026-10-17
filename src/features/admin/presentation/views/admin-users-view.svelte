<script lang="ts">
	import AdminPageHeader from '../components/admin-page-header.svelte';
	import type { AdminUsersData, AdminFormResult } from '../models/admin-view.model';

	let { data, form }: { data: AdminUsersData; form?: AdminFormResult } = $props();
</script>

<svelte:head>
	<title>Kelola Pengguna | Admin - Nihongo no Hikari</title>
	<meta name="description" content="Kelola pengguna dan akses admin Nihongo no Hikari." />
</svelte:head>

<div class="admin-page">
	<AdminPageHeader
		title="Kelola Pengguna"
		description="Atur akses User dan Admin untuk akun yang sudah terdaftar."
	/>
	{#if form?.message}
		<p class="admin-notice" role="status">{form.message}</p>
	{/if}
	<div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
		<table class="w-full text-left text-sm">
			<thead class="border-b bg-slate-50 text-slate-600">
				<tr>
					<th class="admin-row">Nama</th>
					<th class="admin-row">Email</th>
					<th class="admin-row">Role</th>
					<th class="admin-row">Aksi</th>
				</tr>
			</thead>
			<tbody>
				{#each data.users as user (user.id)}
					<tr class="border-b last:border-0">
						<td class="admin-row font-medium">{user.display_name}</td>
						<td class="admin-row">{user.email}</td>
						<td class="admin-row">{user.role}</td>
						<td class="admin-row">
							{#if user.id === data.user?.id}
								<span class="text-slate-500">Akun Anda</span>
							{:else}
								<form method="POST" action="?/changeRole" class="flex items-center gap-2">
									<input type="hidden" name="userId" value={user.id} />
									<input
										type="hidden"
										name="role"
										value={user.role === 'Admin' ? 'User' : 'Admin'}
									/>
									<button type="submit" class="rounded-md border px-4 py-2 hover:bg-slate-50">
										{user.role === 'Admin' ? 'Jadikan User' : 'Jadikan Admin'}
									</button>
								</form>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
