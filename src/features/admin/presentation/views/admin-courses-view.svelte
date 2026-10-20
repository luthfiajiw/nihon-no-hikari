<script lang="ts">
	import AdminPageHeader from '../components/admin-page-header.svelte';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { BookOpen, Plus, Pencil, ArrowRight, Search, Layers, FileText } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import StatusBadge from '$features/admin/presentation/components/status-badge.svelte';
	import { matchesContent } from '$features/admin/domain/content-policy';
	import courseImage from '$lib/assets/images/n5-course-bg.png';
	import type { AdminCoursesData } from '../models/admin-view.model';
	let { data }: { data: AdminCoursesData } = $props();
	let status = $state('all');
	let search = $derived(page.url.searchParams.get('q') ?? '');
	const courses = $derived(data.courses.filter((course) => matchesContent(course, search, status)));
</script>

<svelte:head>
	<title>Kursus &amp; Materi | Admin - Nihongo no Hikari</title>
	<meta name="description" content="Kelola kursus, module, dan lesson Nihongo no Hikari." />
</svelte:head>

<div class="admin-page">
	<AdminPageHeader
		title="Kursus & Materi"
		description="Kelola kursus dan susun perjalanan belajar siswa."
	>
		{#snippet actions()}
			<Button onclick={() => goto(resolve('/admin/content/course/new'))} class="gap-2 px-4">
				<Plus class="size-4" /> Buat Kursus
			</Button>
		{/snippet}
	</AdminPageHeader>
	<Card.Root
		size="sm"
		class="flex-row flex-wrap items-center justify-between gap-4 px-(--card-spacing)"
	>
		<div class="flex flex-wrap gap-1" aria-label="Filter status kursus">
			{#each [{ value: 'all', label: 'Semua' }, { value: 'published', label: 'Terbit' }, { value: 'draft', label: 'Draft' }, { value: 'archived', label: 'Arsip' }] as tab (tab.value)}
				<button
					type="button"
					onclick={() => (status = tab.value)}
					aria-pressed={status === tab.value}
					class="rounded-lg px-3 py-2 text-sm font-medium transition-colors {status === tab.value
						? 'bg-sky-50 text-sky-700'
						: 'text-muted-foreground hover:bg-muted'}"
				>
					{tab.label}
				</button>
			{/each}
		</div>
		<div class="relative w-full sm:w-64">
			<Search class="absolute top-2.5 left-3 size-4 text-muted-foreground/70" />
			<Input
				bind:value={search}
				aria-label="Cari kursus"
				placeholder="Cari kursus..."
				class="h-9 pl-9"
			/>
		</div>
	</Card.Root>
	<p class="text-xs font-medium text-muted-foreground">{courses.length} kursus ditampilkan</p>
	<div class="admin-stack">
		{#each courses as course (course.id)}
			<Card.Root
				role="article"
				class="group flex-wrap gap-4 px-(--card-spacing) sm:flex-row sm:items-center"
			>
				<button
					type="button"
					onclick={() => goto(resolve(`/admin/courses/${course.id}` as Pathname))}
					aria-label={`Lihat materi ${course.title}`}
					class="shrink-0 overflow-hidden rounded-xl"
				>
					<img
						src={course.thumbnail_url || courseImage}
						alt=""
						class="h-40 w-full object-cover sm:h-28 sm:w-44"
					/>
				</button>
				<div class="min-w-0 flex-1">
					<StatusBadge item={course} />
					<h2 class="mt-2 text-xl font-bold tracking-tight text-foreground">
						<button
							type="button"
							class="text-left hover:text-sky-600"
							onclick={() => goto(resolve(`/admin/courses/${course.id}` as Pathname))}
						>
							{course.title}
						</button>
					</h2>
					<p class="mt-1 line-clamp-2 text-sm text-muted-foreground">
						{course.description || 'Susun module dan lesson untuk kursus ini.'}
					</p>
					<div class="mt-3 flex gap-4 text-xs text-muted-foreground">
						<span class="flex items-center gap-1.5">
							<Layers class="size-3.5" />
							{course.module_count ?? 0} module
						</span>
						<span class="flex items-center gap-1.5">
							<FileText class="size-3.5" />
							{course.lesson_count ?? 0} lesson
						</span>
					</div>
				</div>
				<div class="flex shrink-0 flex-wrap gap-2 sm:ml-auto">
					<Button
						variant="outline"
						onclick={() => goto(resolve(`/admin/content/course/${course.id}` as Pathname))}
						class="px-4"
					>
						<Pencil class="size-3.5" /> Edit
					</Button>
					<Button
						onclick={() => goto(resolve(`/admin/courses/${course.id}` as Pathname))}
						class="px-4"
					>
						Lihat Materi <ArrowRight class="size-4" />
					</Button>
				</div>
			</Card.Root>
		{:else}
			<Card.Root class="admin-empty gap-0">
				<BookOpen class="mx-auto mb-4 size-10 text-muted-foreground/50" />
				<h2 class="font-semibold text-foreground">
					{data.courses.length ? 'Kursus tidak ditemukan' : 'Mulai dengan kursus pertama'}
				</h2>
				<p class="mt-2 text-sm text-muted-foreground">
					{data.courses.length
						? 'Coba kata kunci atau filter status lainnya.'
						: 'Buat kursus, lalu tambahkan module dan lesson di halaman detailnya.'}
				</p>
			</Card.Root>
		{/each}
	</div>
</div>
