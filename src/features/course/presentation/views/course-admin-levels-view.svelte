<script lang="ts">
	import type { ManagementFormResult } from '$lib/models/management-form.model';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import { Plus } from 'lucide-svelte';
	import type { CourseAdminLevelsData } from '$features/course/presentation/models/course-admin-view.model';
	import { DataTable } from '$lib/components/data-table';
	import { courseAdminLevelsColumns as columns } from '$features/course/presentation/components/course-admin-levels-columns';

	let { data, form }: { data: CourseAdminLevelsData; form?: ManagementFormResult } = $props();
</script>

<svelte:head>
	<title>Level & Harga | Admin - Gakkobit</title>
	<meta
		name="description"
		content="Atur harga paket sekali bayar untuk setiap level JLPT (N5–N1)."
	/>
</svelte:head>

<div class="admin-page">
	<ManagementPageHeader
		title="Level & Harga"
		description="Atur harga paket sekali bayar dan poin manfaat untuk setiap level JLPT (N5–N1)."
	/>
	{#if form?.message}
		<p class="admin-notice" role="status">{form.message}</p>
	{/if}

	<DataTable
		data={data.levels}
		{columns}
		meta={data.meta}
		searchPlaceholder="Cari level (kode, nama, deskripsi)..."
		emptyMessage="Tidak ada level yang ditemukan."
	>
		{#snippet headerActions()}
			<div class="flex w-full justify-end">
				<Button
					onclick={() => goto(resolve('/(protected)/admin/levels/[id]', { id: 'new' }))}
					class="gap-2 px-4"
				>
					<Plus class="size-4" /> Buat Level
				</Button>
			</div>
		{/snippet}
	</DataTable>
</div>
