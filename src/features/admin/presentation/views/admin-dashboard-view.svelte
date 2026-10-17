<script lang="ts">
	import AdminPageHeader from '../components/admin-page-header.svelte';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { BookOpen, Layers, FileText, ClipboardCheck, ArrowUpRight, Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import type { AdminDashboardData } from '../models/admin-view.model';
	let { data }: { data: AdminDashboardData } = $props();
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
	] as const;
</script>

<svelte:head>
	<title>Ringkasan Admin - Nihongo no Hikari</title>
	<meta name="description" content="Ringkasan pengelolaan konten dan pengguna Nihongo no Hikari." />
</svelte:head>

<div class="admin-page">
	<AdminPageHeader
		title="Ringkasan Admin"
		description="Ruang kerja untuk materi dan penilaian siswa."
	/>
	<div class="admin-fields xl:grid-cols-4">
		{#each cards as card (card.key)}
			<button
				type="button"
				onclick={() => goto(resolve(card.href as Pathname))}
				class="group admin-panel w-full text-left transition-shadow hover:shadow-md"
			>
				<div class="flex items-center justify-between">
					<span class="flex size-11 items-center justify-center rounded-xl {card.color}">
						<card.icon class="size-5" />
					</span>
					<ArrowUpRight class="size-4 text-slate-300 group-hover:text-blue-500" />
				</div>
				<p class="mt-4 text-3xl font-bold tracking-tight">{data.catalog[card.key]?.length ?? 0}</p>
				<p class="mt-1 text-sm text-slate-500">{card.label}</p>
			</button>
		{/each}
	</div>
	<section
		class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-4 sm:p-6"
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
		<Button onclick={() => goto(resolve('/admin/content/course/new'))} class="px-4">
			<Plus class="size-4" /> Buat Kursus
		</Button>
	</section>
</div>
