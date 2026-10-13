<script lang="ts">
	import { ArrowLeft, BookOpen, ChevronDown, FileText, Layers, Pencil, Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import StatusBadge from '$lib/components/admin/status-badge.svelte';
	import courseImage from '$lib/assets/images/n5-course-bg.png';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	const accents = [
		{ strip: 'bg-rose-50/80', icon: 'bg-rose-500', symbol: 'あ' },
		{ strip: 'bg-blue-50/80', icon: 'bg-blue-500', symbol: 'カ' },
		{ strip: 'bg-violet-50/80', icon: 'bg-violet-500', symbol: '語' },
		{ strip: 'bg-emerald-50/80', icon: 'bg-emerald-500', symbol: '文' }
	];
</script>

<div class="space-y-6">
	<a
		href="/admin/courses"
		class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
		><ArrowLeft class="size-4" /> Semua kursus</a
	>
	<header class="flex items-center gap-4">
		<div
			class="flex size-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600"
		>
			<BookOpen class="size-7" />
		</div>
		<div>
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Kursus & Materi</h1>
			<p class="mt-1 text-sm text-slate-500">Susun module dan lesson untuk kursus ini.</p>
		</div>
	</header>
	<section class="flex flex-wrap items-center gap-5 rounded-2xl border bg-white p-5 shadow-sm">
		<img
			src={data.course.thumbnail_url || courseImage}
			alt=""
			class="h-24 w-40 rounded-xl object-cover"
		/>
		<div class="min-w-0 flex-1">
			<StatusBadge item={data.course} />
			<h2 class="mt-2 text-xl font-bold tracking-tight sm:text-2xl">{data.course.title}</h2>
			<p class="mt-1 text-sm text-slate-500">/{data.course.slug}</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" href={`/admin/content/course/${data.course.id}`} class="h-10 px-3"
				><Pencil class="size-4" /> Edit Kursus</Button
			><Button
				href={`/admin/content/module/new?parent=${data.course.id}`}
				class="h-10 bg-blue-600 px-4 hover:bg-blue-700"
				><Plus class="size-4" /> Tambah Module</Button
			>
		</div>
	</section>
	<div class="flex items-center justify-between">
		<h2 class="text-base font-semibold text-slate-800">Struktur pembelajaran</h2>
		<p class="text-xs text-slate-500">
			{data.modules.length} module · {data.lessons.length} lesson
		</p>
	</div>
	<div class="space-y-4">
		{#each data.modules as module, index (module.id)}
			{@const lessons = data.lessons.filter((lesson) => lesson.module_id === module.id)}
			{@const published = lessons.filter(
				(lesson) => lesson.is_published && !lesson.archived_at
			).length}
			{@const accent = accents[index % accents.length]}
			<details
				open={index < 2}
				class="group rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm"
			>
				<summary
					class="flex cursor-pointer list-none flex-wrap items-center gap-3 rounded-xl p-3 [&::-webkit-details-marker]:hidden {accent.strip}"
				>
					<span
						class="flex size-10 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white shadow-sm {accent.icon}"
						>{accent.symbol}</span
					>
					<h3 class="min-w-24 flex-1 font-semibold text-slate-900">{module.title}</h3>
					<StatusBadge item={module} />
					<span
						class="rounded-full border border-slate-200 bg-white/60 px-2 py-1 text-[11px] text-slate-500"
						>{lessons.length} lesson</span
					>
					<div class="mx-3 hidden w-32 xl:block">
						<div class="h-1.5 overflow-hidden rounded-full bg-white">
							<div
								class="h-full rounded-full bg-blue-500"
								style:width={`${lessons.length ? (published / lessons.length) * 100 : 0}%`}
							></div>
						</div>
						<p class="mt-1 text-[10px] text-slate-500">
							{published}/{lessons.length} lesson terbit
						</p>
					</div>
					<Button
						variant="outline"
						href={`/admin/content/module/${module.id}`}
						class="h-8 bg-white px-3"
						aria-label={`Edit module ${module.title}`}><Pencil class="size-3.5" /> Edit</Button
					>
					<Button
						href={`/admin/content/lesson/new?parent=${module.id}`}
						class="h-8 px-3 text-white {accent.icon}"
						><Plus class="size-4" /> <span class="hidden sm:inline">Tambah</span> Lesson</Button
					><ChevronDown
						class="mx-1 size-4 text-slate-400 transition-transform group-open:rotate-180"
					/>
				</summary>
				<div class="grid gap-x-6 px-4 py-2 lg:grid-cols-2">
					{#each lessons as lesson, lessonIndex (lesson.id)}<a
							href={`/admin/content/lesson/${lesson.id}`}
							class="flex items-center gap-3 border-b border-slate-100 py-3 text-sm transition-colors last:border-0 hover:text-blue-600"
							><span
								class="flex h-6 min-w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-medium text-slate-500"
								>{lessonIndex + 1}</span
							><span class="min-w-0 flex-1 truncate font-medium">{lesson.title}</span><StatusBadge
								item={lesson}
							/><Pencil class="size-3.5 shrink-0 text-slate-400" /></a
						>
					{:else}<div class="col-span-full flex items-center gap-3 py-6 text-sm text-slate-500">
							<FileText class="size-5 text-slate-300" /> Belum ada lesson. Tambahkan materi pertama untuk
							module ini.
						</div>{/each}
				</div>
			</details>
		{:else}<div class="rounded-2xl border border-dashed bg-white p-12 text-center">
				<Layers class="mx-auto mb-3 size-10 text-slate-300" />
				<h3 class="font-semibold">Belum ada module</h3>
				<p class="mt-2 text-sm text-slate-500">
					Tambahkan module untuk mulai menyusun materi kursus.
				</p>
			</div>{/each}
	</div>
</div>
