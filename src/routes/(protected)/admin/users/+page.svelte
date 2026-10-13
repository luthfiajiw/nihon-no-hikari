<script lang="ts">
	import { Users } from 'lucide-svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<div class="space-y-6">
	<header class="flex items-center gap-4">
		<div
			class="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600"
		>
			<Users class="size-7" />
		</div>
		<div>
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Kelola Pengguna</h1>
			<p class="mt-1 text-sm text-slate-500">
				Atur akses User dan Admin untuk akun yang sudah terdaftar.
			</p>
		</div>
	</header>
	{#if form?.message}
		<p class="rounded-lg border p-3 text-sm" role="status">{form.message}</p>
	{/if}
	<div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
		<table class="w-full text-left text-sm">
			<thead class="border-b bg-slate-50 text-slate-600">
				<tr
					><th class="p-4">Nama</th><th class="p-4">Email</th><th class="p-4">Role</th><th
						class="p-4">Aksi</th
					></tr
				>
			</thead>
			<tbody>
				{#each data.users as user (user.id)}
					<tr class="border-b last:border-0">
						<td class="p-4 font-medium">{user.display_name}</td>
						<td class="p-4">{user.email}</td>
						<td class="p-4">{user.role}</td>
						<td class="p-4">
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
									<button type="submit" class="rounded-md border px-3 py-1.5 hover:bg-slate-50">
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
