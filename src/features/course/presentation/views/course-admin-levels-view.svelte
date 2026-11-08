<script lang="ts">
	import type { ManagementFormResult } from '$lib/models/management-form.model';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import { Plus, Pencil } from 'lucide-svelte';
	import type { CourseAdminLevelsData } from '$features/course/presentation/models/course-admin-view.model';

	let { data, form }: { data: CourseAdminLevelsData; form?: ManagementFormResult } = $props();

	function formatRupiah(value: number): string {
		if (value === 0) return 'Gratis';
		return 'Rp ' + new Intl.NumberFormat('id-ID').format(value);
	}
</script>

<svelte:head>
	<title>Level & Harga | Admin - Gakkobit</title>
	<meta name="description" content="Atur harga paket sekali bayar untuk setiap level JLPT (N5–N1)." />
</svelte:head>

<div class="admin-page">
	<ManagementPageHeader
		title="Level & Harga"
		description="Atur harga paket sekali bayar dan poin manfaat untuk setiap level JLPT (N5–N1)."
	>
		{#snippet actions()}
			<Button
				onclick={() => goto(resolve('/(protected)/admin/levels/[id]', { id: 'new' }))}
				class="gap-2 px-4"
			>
				<Plus class="size-4" /> Buat Level
			</Button>
		{/snippet}
	</ManagementPageHeader>
	{#if form?.message}
		<p class="admin-notice" role="status">{form.message}</p>
	{/if}
	<Card.Root class="gap-0 py-0">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead class="border-b bg-muted text-muted-foreground">
					<tr>
						<th class="admin-row">Level</th>
						<th class="admin-row">Nama</th>
						<th class="admin-row">Deskripsi</th>
						<th class="admin-row">Harga</th>
						<th class="admin-row">Poin Kartu</th>
						<th class="admin-row">Urutan</th>
						<th class="admin-row text-right">Aksi</th>
					</tr>
				</thead>
				<tbody>
					{#each data.levels as level (level.id)}
						<tr class="border-b last:border-0 hover:bg-muted/40 transition-colors">
							<td class="admin-row font-bold">
								<span
									class="inline-flex items-center justify-center rounded-lg bg-surface-container-highest px-2.5 py-1 text-xs font-bold text-on-surface"
								>
									{level.code}
								</span>
							</td>
							<td class="admin-row font-medium">{level.name}</td>
							<td class="admin-row max-w-xs truncate text-muted-foreground">
								{level.description || '-'}
							</td>
							<td class="admin-row font-semibold text-foreground">
								{formatRupiah(level.price)}
							</td>
							<td class="admin-row text-muted-foreground">
								{level.points?.length ?? 0} poin
							</td>
							<td class="admin-row text-muted-foreground">{level.order_index}</td>
							<td class="admin-row text-right">
								<Button
									variant="outline"
									size="sm"
									class="gap-1.5"
									aria-label={`Edit ${level.code}`}
									onclick={() =>
										goto(resolve('/(protected)/admin/levels/[id]', { id: level.id }))}
								>
									<Pencil class="size-3.5" /> Edit
								</Button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Card.Root>
</div>
