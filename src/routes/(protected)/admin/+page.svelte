<script lang="ts">
	import {
		BookOpen,
		Layers,
		FileText,
		ClipboardCheck,
		ArrowUpRight,
		Plus,
		LayoutDashboard
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	const cards = [
		{
			key: 'courses',
			label: 'Kursus',
			href: '/admin/courses',
			icon: BookOpen,
			color: 'bg-blue-50 text-blue-600'
		},
		{
			key: 'modules',
			label: 'Module',
			href: '/admin/courses',
			icon: Layers,
			color: 'bg-violet-50 text-violet-600'
		},
		{
			key: 'lessons',
			label: 'Lesson',
			href: '/admin/courses',
			icon: FileText,
			color: 'bg-rose-50 text-rose-500'
		},
		{
			key: 'question_sets',
			label: 'Question Sets',
			href: '/admin/question-sets',
			icon: ClipboardCheck,
			color: 'bg-emerald-50 text-emerald-600'
		}
	];
</script>

<div class="space-y-7">
	<header class="flex items-center gap-4">
		<div
			class="flex size-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600"
		>
			<LayoutDashboard class="size-7" />
		</div>
		<div>
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Ringkasan Admin</h1>
			<p class="mt-1 text-sm text-slate-500">Ruang kerja untuk materi dan penilaian siswa.</p>
		</div>
	</header>
	<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each cards as card}<a
				href={card.href}
				class="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
				><div class="flex items-center justify-between">
					<span class="flex size-11 items-center justify-center rounded-xl {card.color}"
						><card.icon class="size-5" /></span
					><ArrowUpRight class="size-4 text-slate-300 group-hover:text-blue-500" />
				</div>
				<p class="mt-5 text-3xl font-bold tracking-tight">{data.catalog[card.key]?.length ?? 0}</p>
				<p class="mt-1 text-sm text-slate-500">{card.label}</p></a
			>{/each}
	</div>
	<section
		class="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-6 sm:p-8"
	>
		<div>
			<p class="text-xs font-semibold tracking-wider text-blue-600 uppercase">
				Kelola pembelajaran
			</p>
			<h2 class="mt-2 text-xl font-bold text-slate-900">
				Materi yang tertata, belajar lebih terarah.
			</h2>
			<p class="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
				Mulai dari kursus, susun module dan lesson, lalu lengkapi dengan latihan. Simpan perubahan
				sebagai draft sebelum diterbitkan.
			</p>
		</div>
		<Button href="/admin/content/course/new" class="h-10 bg-blue-600 px-4 hover:bg-blue-700"
			><Plus class="size-4" /> Buat Kursus</Button
		>
	</section>
</div>
