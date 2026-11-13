<script lang="ts">
	import type { ManagementFormResult } from '$lib/models/management-form.model';
	import type { ResolvedPathname } from '$app/types';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import ManagementSelect from '$lib/components/management-select.svelte';
	import { Plus } from 'lucide-svelte';
	import type { CourseAdminLevelsData } from '$features/course/presentation/models/course-admin-view.model';
	import { DataTable } from '$lib/components/data-table';
	import { courseAdminLevelsColumns as columns } from '$features/course/presentation/components/course-admin-levels-columns';

	let { data, form }: { data: CourseAdminLevelsData; form?: ManagementFormResult } = $props();

	const currentPriceType = $derived(page.url.searchParams.get('price_type') ?? 'all');

	const priceTypeOptions = [
		{ value: 'all', label: 'Semua harga' },
		{ value: 'free', label: 'Gratis' },
		{ value: 'paid', label: 'Berbayar' }
	];

	function updateFilter(key: 'price_type', value: string) {
		const url = new URL(page.url);
		if (value === 'all') {
			url.searchParams.delete(key);
		} else {
			url.searchParams.set(key, value);
		}
		url.searchParams.delete('page');
		goto(`${resolve('/(protected)/admin/levels')}${url.search}` as ResolvedPathname, {
			keepFocus: true,
			noScroll: true,
			replaceState: true
		});
	}
</script>

<svelte:head>
	<title>Level & Harga | Admin - Gakkobit</title>
	<meta
		name="description"
		content="Atur harga paket sekali bayar untuk setiap level JLPT (N5–N1)."
	/>
</svelte:head>

<div class="flex flex-col space-y-6">
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
			<div class="flex w-full items-center justify-between gap-2">
				<ManagementSelect
					aria-label="Filter harga"
					value={currentPriceType}
					options={priceTypeOptions}
					class="h-9 bg-background text-muted-foreground sm:w-40"
					onchange={(val: string) => updateFilter('price_type', val)}
				/>
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
