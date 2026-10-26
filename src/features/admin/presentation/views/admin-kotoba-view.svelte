<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { kotobaRepository } from '$dependencies/kotoba.dependency';
	import { KotobaError } from '$features/kotoba/domain/entities/kotoba-api.entity';
	import { mediaNeedsRefresh } from '$features/kotoba/presentation/models/kotoba-api.model';
	import { resolve } from '$app/paths';
	import { BookOpen, EyeOff, Languages, Pencil, Plus, Search, Trash2 } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { kotobaLevels } from '$features/kotoba/data/kotoba-topics';
	import AdminPageHeader from '../components/admin-page-header.svelte';
	import AdminSelect from '../components/admin-select.svelte';
	import Cover from '../components/admin-kotoba-cover.svelte';
	import { getAdminKotobaState } from '../contexts/admin-kotoba-context.svelte';
	import type { AdminKotobaTopic } from '../models/admin-kotoba.model';

	const kotoba = getAdminKotobaState();
	let { topics: allTopics }: { topics: AdminKotobaTopic[] } = $props();
	let busy = $state(false);
	let message = $state('');
	onMount(() => {
		let refreshing = false;
		async function refresh() {
			if (refreshing || !allTopics.some((topic) => mediaNeedsRefresh(topic.mediaExpiresAt))) return;
			refreshing = true;
			try {
				await invalidate('kotoba:topics');
			} catch {
				message = 'Daftar topik belum dapat diperbarui. Coba lagi sebentar.';
			} finally {
				refreshing = false;
			}
		}
		const timer = window.setInterval(() => void refresh(), 60_000);
		window.addEventListener('focus', refresh);
		return () => {
			window.clearInterval(timer);
			window.removeEventListener('focus', refresh);
		};
	});
	async function removeTopic() {
		if (!deleting || busy) return;
		busy = true;
		message = '';
		try {
			await kotobaRepository.remove(deleting.id);
			kotoba.notice = `Topik “${deleting.title}” berhasil dihapus.`;
			deleteOpen = false;
			deleting = null;
			await invalidate('kotoba:topics');
		} catch (cause) {
			message = cause instanceof Error ? cause.message : 'Gagal menghapus topik.';
			if (cause instanceof KotobaError && cause.status === 401) await goto(resolve('/signin'));
		} finally {
			busy = false;
		}
	}
	let search = $state('');
	let level = $state('all');
	let status = $state('all');
	let sort = $state('order');
	let deleting = $state<AdminKotobaTopic | null>(null);
	let deleteOpen = $state(false);
	const topics = $derived(
		allTopics
			.filter((topic) => {
				const query = search.trim().toLocaleLowerCase('id');
				return (
					`${topic.title} ${topic.description}`.toLocaleLowerCase('id').includes(query) &&
					(level === 'all' || topic.level === level) &&
					(status === 'all' || topic.active === (status === 'active'))
				);
			})
			.sort((a, b) => (sort === 'title' ? a.title.localeCompare(b.title, 'id') : a.order - b.order))
	);
</script>

<svelte:head>
	<title>Kotoba | Admin - Nihongo no Hikari</title>
	<meta name="description" content="Kelola topik dan kosakata bahasa Jepang." />
</svelte:head>

<div class="admin-page">
	<AdminPageHeader title="Kotoba" description="Kelola topik dan susun kosakata untuk siswa.">
		{#snippet actions()}
			<Button onclick={() => goto(resolve('/(protected)/admin/kotoba/[id]', { id: 'new' }))}>
				<Plus class="size-4" /> Buat Topik
			</Button>
		{/snippet}
	</AdminPageHeader>
	{#if message}<p class="admin-notice border-destructive text-destructive" role="alert">
			{message}
		</p>{/if}
	{#if kotoba.notice}<p
			class="admin-notice border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
			role="status"
		>
			{kotoba.notice}
		</p>{/if}
	<Card.Root size="sm" class="px-(--card-spacing)">
		<div
			class="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]"
		>
			<div class="relative">
				<Search class="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" />
				<Input
					type="search"
					bind:value={search}
					aria-label="Cari topik"
					placeholder="Cari topik..."
					class="h-10 pl-9"
				/>
			</div>
			<AdminSelect
				aria-label="Filter level JLPT"
				bind:value={level}
				options={[
					{ value: 'all', label: 'Semua level' },
					...kotobaLevels.map((value) => ({ value, label: value }))
				]}
			/>
			<AdminSelect
				aria-label="Filter status"
				bind:value={status}
				options={[
					{ value: 'all', label: 'Semua status' },
					{ value: 'active', label: 'Aktif' },
					{ value: 'inactive', label: 'Nonaktif' }
				]}
			/>
			<AdminSelect
				aria-label="Urutkan topik"
				bind:value={sort}
				options={[
					{ value: 'order', label: 'Urutan topik' },
					{ value: 'title', label: 'Nama A–Z' }
				]}
			/>
		</div>
	</Card.Root>
	<p class="text-xs font-medium text-muted-foreground" role="status">
		{topics.length} dari {allTopics.length} topik ditampilkan
	</p>
	<div class="admin-stack">
		{#each topics as topic (topic.id)}
			<Card.Root
				data-topic-id={topic.id}
				class="flex-wrap gap-4 px-(--card-spacing) sm:flex-row sm:items-center"
			>
				<Cover
					media={topic.cover}
					class="aspect-[3/1] w-full shrink-0 sm:aspect-auto sm:h-28 sm:w-40"
				/>
				<div class="min-w-0 flex-1 space-y-2">
					<div class="flex flex-wrap items-center gap-2">
						<Badge>{topic.level}</Badge><Badge variant="secondary">{topic.category}</Badge>
						<Badge
							variant="outline"
							class={topic.active
								? 'border-emerald-300 text-emerald-700 dark:text-emerald-300'
								: 'text-muted-foreground'}
						>
							{topic.active ? 'Aktif' : 'Nonaktif'}
						</Badge>
						{#if !topic.visible}<span class="flex items-center gap-1 text-xs text-muted-foreground">
								<EyeOff class="size-3.5" /> Disembunyikan
							</span>{/if}
					</div>
					<h2 class="text-xl font-semibold tracking-tight">{topic.title}</h2>
					<p class="line-clamp-2 text-sm text-muted-foreground">{topic.description}</p>
					<div class="flex flex-wrap gap-4 text-xs text-muted-foreground">
						<span class="flex items-center gap-1.5">
							<BookOpen class="size-3.5" />{topic.vocabularyCount ?? topic.vocabulary.length} kosakata
						</span>
						<span>Urutan {topic.order}</span>
					</div>
				</div>
				<div class="flex shrink-0 gap-2">
					<Button
						variant="outline"
						onclick={() => goto(resolve('/(protected)/admin/kotoba/[id]', { id: topic.id }))}
						aria-label={`Edit topik ${topic.title}`}
					>
						<Pencil class="size-4" /> Edit
					</Button>
					<Button
						variant="ghost"
						size="icon"
						aria-label={`Hapus topik ${topic.title}`}
						onclick={() => {
							deleting = topic;
							deleteOpen = true;
						}}
					>
						<Trash2 class="size-4 text-destructive" />
					</Button>
				</div>
			</Card.Root>
		{:else}
			<Card.Root class="admin-empty items-center">
				<Languages class="size-10 text-muted-foreground/50" />
				<h2 class="font-semibold">
					{allTopics.length ? 'Topik tidak ditemukan' : 'Belum ada topik'}
				</h2>
				<p class="text-sm text-muted-foreground">
					{allTopics.length
						? 'Coba kata kunci atau filter lainnya.'
						: 'Mulai dengan membuat topik kosakata pertama.'}
				</p>
				{#if allTopics.length}<Button
						variant="outline"
						onclick={() => {
							search = '';
							level = 'all';
							status = 'all';
						}}
					>
						Reset filter
					</Button>{/if}
			</Card.Root>
		{/each}
	</div>
</div>

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Hapus topik?</Dialog.Title>
			<Dialog.Description>
				Topik “{deleting?.title}” beserta kosakatanya akan dihapus.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" disabled={busy} onclick={() => (deleteOpen = false)}>Batal</Button>
			<Button variant="destructive" disabled={busy} onclick={removeTopic}>
				{busy ? 'Menghapus...' : 'Hapus Topik'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
