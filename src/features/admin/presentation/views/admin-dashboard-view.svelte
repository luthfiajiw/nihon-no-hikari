<script lang="ts">
	import AdminPageHeader from '../components/admin-page-header.svelte';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { BookOpen, Layers, FileText, ClipboardCheck, ArrowUpRight, Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { AdminDashboardData } from '../models/admin-view.model';
	let { data }: { data: AdminDashboardData } = $props();
	const cards = [
		{
			key: 'courses',
			label: 'Kursus',
			href: '/admin/courses',
			icon: BookOpen,
			color: 'bg-sky-50 text-sky-600'
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
				data-slot="card"
				data-size="default"
				class={Card.cardVariants({
					class:
						'group block w-full px-(--card-spacing) text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4'
				})}
			>
				<div class="flex items-center justify-between">
					<span class="flex size-11 items-center justify-center rounded-xl {card.color}">
						<card.icon class="size-5" />
					</span>
					<ArrowUpRight class="size-4 text-muted-foreground/50 group-hover:text-sky-500" />
				</div>
				<p class="mt-4 text-3xl font-bold tracking-tight">{data.catalog[card.key]?.length ?? 0}</p>
				<p class="mt-1 text-sm text-muted-foreground">{card.label}</p>
			</button>
		{/each}
	</div>
	<Card.Root class="flex-row flex-wrap items-center justify-between px-(--card-spacing)">
		<div>
			<p class="text-xs font-semibold tracking-wider text-sky-600 uppercase">Kelola pembelajaran</p>
			<h2 class="mt-2 text-xl font-bold text-foreground">
				Materi yang tertata, belajar lebih terarah.
			</h2>
			<p class="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
				Mulai dari kursus, susun module dan lesson, lalu lengkapi dengan latihan. Simpan perubahan
				sebagai draft sebelum diterbitkan.
			</p>
		</div>
		<Button onclick={() => goto(resolve('/admin/content/course/new'))} class="px-4">
			<Plus class="size-4" /> Buat Kursus
		</Button>
	</Card.Root>
</div>
