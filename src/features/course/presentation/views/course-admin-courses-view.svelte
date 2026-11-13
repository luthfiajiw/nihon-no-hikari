<script lang="ts">
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import ManagementSelect from '$lib/components/management-select.svelte';
	import type { ResolvedPathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { DataTable } from '$lib/components/data-table';
	import { courseAdminCoursesColumns } from '$features/course/presentation/components/course-admin-courses-columns';
	import type { CourseAdminCoursesData } from '$features/course/presentation/models/course-admin-view.model';

	let { data }: { data: CourseAdminCoursesData } = $props();

	const currentLevel = $derived(page.url.searchParams.get('level') ?? 'all');
	const currentStatus = $derived(page.url.searchParams.get('status') ?? 'all');

	const levelOptions = [
		{ value: 'all', label: 'Semua level' },
		{ value: 'N5', label: 'N5' },
		{ value: 'N4', label: 'N4' },
		{ value: 'N3', label: 'N3' },
		{ value: 'N2', label: 'N2' },
		{ value: 'N1', label: 'N1' }
	];

	const statusOptions = [
		{ value: 'all', label: 'Semua status' },
		{ value: 'published', label: 'Terbit' },
		{ value: 'draft', label: 'Draft' },
		{ value: 'archived', label: 'Arsip' }
	];

	function updateFilter(key: 'level' | 'status', value: string) {
		const url = new URL(page.url);
		if (value === 'all') {
			url.searchParams.delete(key);
		} else {
			url.searchParams.set(key, value);
		}
		url.searchParams.delete('page');
		goto(`${resolve('/(protected)/admin/courses')}${url.search}` as ResolvedPathname, {
			keepFocus: true,
			noScroll: true,
			replaceState: true
		});
	}
</script>

<svelte:head>
	<title>Kursus &amp; Materi | Admin - Gakkobit</title>
	<meta name="description" content="Kelola kursus, module, dan lesson Gakkobit." />
</svelte:head>

<div class="flex flex-col space-y-6">
	<ManagementPageHeader
		title="Kursus & Materi"
		description="Kelola kursus dan susun perjalanan belajar siswa."
	/>

	<DataTable
		data={data.courses}
		columns={courseAdminCoursesColumns}
		meta={data.meta}
		searchPlaceholder="Cari kursus..."
		emptyMessage="Tidak ada kursus yang ditemukan."
	>
		{#snippet headerActions()}
			<div class="flex w-full flex-wrap items-center justify-between gap-2">
				<div class="flex items-center gap-2">
					<ManagementSelect
						aria-label="Filter level"
						value={currentLevel}
						options={levelOptions}
						class="h-9 bg-background text-muted-foreground sm:w-36"
						onchange={(val: string) => updateFilter('level', val)}
					/>
					<ManagementSelect
						aria-label="Filter status"
						value={currentStatus}
						options={statusOptions}
						class="h-9 bg-background text-muted-foreground sm:w-36"
						onchange={(val: string) => updateFilter('status', val)}
					/>
				</div>

				<Button onclick={() => goto(resolve('/admin/content/course/new'))} class="gap-2 px-4">
					<Plus class="size-4" /> Buat Kursus
				</Button>
			</div>
		{/snippet}
	</DataTable>
</div>
