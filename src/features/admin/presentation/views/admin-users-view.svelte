<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
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
	<Card.Root class="gap-0 py-0">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead class="border-b bg-muted text-muted-foreground">
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
									<span class="text-muted-foreground">Akun Anda</span>
								{:else}
									<form method="POST" action="?/changeRole" class="flex items-center gap-2">
										<Input type="hidden" name="userId" value={user.id} />
										<Input
											type="hidden"
											name="role"
											value={user.role === 'Admin' ? 'User' : 'Admin'}
										/>
										<Button type="submit" variant="outline">
											{user.role === 'Admin' ? 'Jadikan User' : 'Jadikan Admin'}
										</Button>
									</form>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Card.Root>
</div>
