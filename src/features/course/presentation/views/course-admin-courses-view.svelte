<script lang="ts">
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import ManagementSelect from '$lib/components/management-select.svelte';
	import type { ResolvedPathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { manageCourseAdminContentUseCase } from '$dependencies/course.dependency';
	import type { CourseAdminRecord } from '$features/course/domain/entities/course-admin.entity';
	import { HttpError } from '$lib/http/http-error';
	import { Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { DataTable } from '$lib/components/data-table';
	import { createCourseAdminCoursesColumns } from '$features/course/presentation/components/course-admin-courses-columns';
	import type { CourseAdminCoursesData } from '$features/course/presentation/models/course-admin-view.model';

	let { data }: { data: CourseAdminCoursesData } = $props();

	let busy = $state(false);
	let message = $state('');
	let notice = $state('');
	let deleting = $state<CourseAdminRecord | null>(null);
	let deleteOpen = $state(false);

	async function removeCourse() {
		if (!deleting || busy) return;
		busy = true;
		message = '';
		notice = '';
		try {
			await manageCourseAdminContentUseCase.exec('remove', 'course', deleting.id);
			notice = `Kursus “${deleting.title}” berhasil dihapus.`;
			deleteOpen = false;
			deleting = null;
			await invalidate('course:courses');
		} catch (cause) {
			message = cause instanceof Error ? cause.message : 'Gagal menghapus kursus.';
			deleteOpen = false;
			deleting = null;
			if (cause instanceof HttpError && cause.status === 401) await goto(resolve('/signin'));
		} finally {
			busy = false;
		}
	}

	const columns = createCourseAdminCoursesColumns((course) => {
		deleting = course;
		deleteOpen = true;
	});

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
	{/if}

	<DataTable
		data={data.courses}
		{columns}
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

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Hapus kursus?</Dialog.Title>
			<Dialog.Description>
				Kursus “{deleting?.title}” akan dihapus atau diarsipkan jika sudah memiliki riwayat siswa.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" disabled={busy} onclick={() => (deleteOpen = false)}>Batal</Button>
			<Button variant="destructive" disabled={busy} onclick={removeCourse}>
				{busy ? 'Menghapus...' : 'Hapus Kursus'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
