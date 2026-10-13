<script lang="ts">
	import { page } from '$app/state';
	import { BookOpen, Plus, Pencil, ArrowRight, Search, Layers, FileText } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import StatusBadge from '$lib/components/admin/status-badge.svelte';
	import { matchesContent } from '$lib/admin';
	import courseImage from '$lib/assets/images/n5-course-bg.png';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	let status = $state('all');
	let search = $state('');
	$effect(() => {
		search = page.url.searchParams.get('q') ?? '';
	});
	const courses = $derived(data.courses.filter((course) => matchesContent(course, search, status)));
</script>

<div class="space-y-6">
	<header class="flex flex-wrap items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<div
				class="flex size-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600"
			>
				<BookOpen class="size-7" />
			</div>
			<div>
				<h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
					Kursus & Materi
				</h1>
				<p class="mt-1 text-sm text-slate-500">Kelola kursus dan susun perjalanan belajar siswa.</p>
			</div>
		</div>
		<Button href="/admin/content/course/new" class="h-10 gap-2 bg-blue-600 px-4 hover:bg-blue-700"
			><Plus class="size-4" /> Buat Kursus</Button
		>
	</header>
	<div
		class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
	>
		<div class="flex gap-1" aria-label="Filter status kursus">
			{#each [{ value: 'all', label: 'Semua' }, { value: 'published', label: 'Terbit' }, { value: 'draft', label: 'Draft' }, { value: 'archived', label: 'Arsip' }] as tab}<button
					type="button"
					onclick={() => (status = tab.value)}
					aria-pressed={status === tab.value}
					class="rounded-lg px-3 py-2 text-sm font-medium transition-colors {status === tab.value
						? 'bg-blue-50 text-blue-700'
						: 'text-slate-500 hover:bg-slate-50'}">{tab.label}</button
				>{/each}
		</div>
		<div class="relative w-full sm:w-64">
			<Search class="absolute top-2.5 left-3 size-4 text-slate-400" /><input
				bind:value={search}
				aria-label="Cari kursus"
				placeholder="Cari kursus..."
				class="h-9 w-full rounded-lg border border-slate-200 pr-3 pl-9 text-sm outline-none focus:border-blue-400"
			/>
		</div>
	</div>
	<p class="text-xs font-medium text-slate-500">{courses.length} kursus ditampilkan</p>
	<div class="space-y-4">
		{#each courses as course (course.id)}
			<article
				class="group flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:p-5"
			>
				<a
					href={`/admin/courses/${course.id}`}
					aria-label={`Lihat materi ${course.title}`}
					class="shrink-0 overflow-hidden rounded-xl"
					><img
						src={course.thumbnail_url || courseImage}
						alt=""
						class="h-40 w-full object-cover sm:h-28 sm:w-44"
					/></a
				>
				<div class="min-w-0 flex-1">
					<StatusBadge item={course} />
					<h2 class="mt-2 text-xl font-bold tracking-tight text-slate-900">
						<a class="hover:text-blue-600" href={`/admin/courses/${course.id}`}>{course.title}</a>
					</h2>
					<p class="mt-1 line-clamp-2 text-sm text-slate-500">
						{course.description || 'Susun module dan lesson untuk kursus ini.'}
					</p>
					<div class="mt-3 flex gap-4 text-xs text-slate-500">
						<span class="flex items-center gap-1.5"
							><Layers class="size-3.5" /> {course.module_count ?? 0} module</span
						><span class="flex items-center gap-1.5"
							><FileText class="size-3.5" /> {course.lesson_count ?? 0} lesson</span
						>
					</div>
				</div>
				<div class="flex shrink-0 gap-2">
					<Button variant="outline" href={`/admin/content/course/${course.id}`} class="h-9 px-3"
						><Pencil class="size-3.5" /> Edit</Button
					><Button
						href={`/admin/courses/${course.id}`}
						class="h-9 bg-blue-600 px-3 hover:bg-blue-700"
						>Lihat Materi <ArrowRight class="size-4" /></Button
					>
				</div>
			</article>
		{:else}<div class="rounded-2xl border border-dashed bg-white px-6 py-16 text-center">
				<BookOpen class="mx-auto mb-4 size-10 text-slate-300" />
				<h2 class="font-semibold text-slate-800">
					{data.courses.length ? 'Kursus tidak ditemukan' : 'Mulai dengan kursus pertama'}
				</h2>
				<p class="mt-2 text-sm text-slate-500">
					{data.courses.length
						? 'Coba kata kunci atau filter status lainnya.'
						: 'Buat kursus, lalu tambahkan module dan lesson di halaman detailnya.'}
				</p>
			</div>{/each}
	</div>
</div>
