<script lang="ts">
	import { page } from '$app/state';
	import { ClipboardCheck, Plus, Search, ArrowUpRight, BookOpen, PenLine } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import StatusBadge from '$lib/components/admin/status-badge.svelte';
	import { matchesContent } from '$lib/admin';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	let search = $state('');
	let status = $state('all');
	let skill = $state('all');
	$effect(() => {
		search = page.url.searchParams.get('q') ?? '';
	});
	const sets = $derived(
		data.sets.filter(
			(set) => matchesContent(set, search, status) && (skill === 'all' || set.skill === skill)
		)
	);
</script>

<div class="space-y-6">
	<header class="flex flex-wrap items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<div
				class="flex size-14 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-600"
			>
				<ClipboardCheck class="size-7" />
			</div>
			<div>
				<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Question Sets</h1>
				<p class="mt-1 text-sm text-slate-500">Kelola latihan lesson dan ujian akhir module.</p>
			</div>
		</div>
		<Button href="/admin/content/question_set/new" class="h-10 bg-blue-600 px-4 hover:bg-blue-700"
			><Plus class="size-4" /> Buat Question Set</Button
		>
	</header>
	<div class="flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm">
		<div class="relative min-w-48 flex-1">
			<Search class="absolute top-2.5 left-3 size-4 text-slate-400" /><input
				bind:value={search}
				aria-label="Cari question set"
				placeholder="Cari question set..."
				class="h-9 w-full rounded-lg border border-slate-200 pr-3 pl-9 text-sm outline-none focus:border-blue-400"
			/>
		</div>
		<select
			bind:value={skill}
			aria-label="Filter skill"
			class="h-9 rounded-lg border bg-white px-3 text-sm text-slate-600"
			><option value="all">Semua skill</option><option value="reading">Reading</option><option
				value="writing">Writing</option
			></select
		>
		<select
			bind:value={status}
			aria-label="Filter status"
			class="h-9 rounded-lg border bg-white px-3 text-sm text-slate-600"
			><option value="all">Semua status</option><option value="published">Terbit</option><option
				value="draft">Draft</option
			><option value="archived">Arsip</option></select
		>
	</div>
	<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
		<div
			class="flex justify-between border-b bg-slate-50/70 px-5 py-3 text-xs font-medium text-slate-500"
		>
			<span>{sets.length} question set</span><span>Kelola soal & pengaturan</span>
		</div>
		{#each sets as set (set.id)}<a
				href={`/admin/content/question_set/${set.id}`}
				class="group flex items-center gap-4 border-b border-slate-100 px-5 py-5 transition-colors last:border-0 hover:bg-blue-50/40"
				><div
					class="flex size-11 shrink-0 items-center justify-center rounded-xl {set.skill ===
					'writing'
						? 'bg-rose-50 text-rose-500'
						: 'bg-blue-50 text-blue-500'}"
				>
					{#if set.skill === 'writing'}<PenLine class="size-5" />{:else}<BookOpen
							class="size-5"
						/>{/if}
				</div>
				<div class="min-w-0 flex-1">
					<h2 class="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-600">
						{set.title}
					</h2>
					<p class="mt-1 text-xs text-slate-500">
						{set.kind === 'final_exam' ? 'Ujian module' : 'Latihan lesson'} · {set.skill ===
						'writing'
							? 'Writing'
							: set.skill === 'reading'
								? 'Reading'
								: 'Gabungan'} · Versi {set.version ?? 1}
					</p>
				</div>
				<StatusBadge item={set} /><ArrowUpRight
					class="size-4 shrink-0 text-slate-400 group-hover:text-blue-600"
				/></a
			>
		{:else}<div class="px-6 py-16 text-center">
				<ClipboardCheck class="mx-auto mb-4 size-10 text-slate-300" />
				<h2 class="font-semibold">
					{data.sets.length ? 'Question set tidak ditemukan' : 'Belum ada question set'}
				</h2>
				<p class="mt-2 text-sm text-slate-500">
					{data.sets.length
						? 'Coba kata kunci atau filter lainnya.'
						: 'Buat latihan reading atau writing untuk mulai menyusun soal.'}
				</p>
			</div>{/each}
	</div>
</div>
