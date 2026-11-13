<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { kotobaRepository } from '$dependencies/kotoba.dependency';
	import { KotobaError } from '$features/kotoba/domain/entities/kotoba-api.entity';
	import { mediaNeedsRefresh } from '$features/kotoba/presentation/models/kotoba-api.model';
	import { resolve } from '$app/paths';
	import type { ResolvedPathname } from '$app/types';
	import { Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { kotobaLevels } from '$features/kotoba/data/kotoba-topics';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import ManagementSelect from '$lib/components/management-select.svelte';
	import { getKotobaAdminState } from '$features/kotoba/presentation/contexts/kotoba-admin-context.svelte';
	import type { KotobaAdminTopic } from '$features/kotoba/presentation/models/kotoba-admin.model';
	import type { PaginationMeta } from '$lib/models/pagination.model';
	import { DataTable } from '$lib/components/data-table';
	import { createKotobaAdminColumns } from '$features/kotoba/presentation/components/kotoba-admin-columns';

	const kotoba = getKotobaAdminState();
	let {
		topics: allTopics,
		meta
	}: {
		topics: KotobaAdminTopic[];
		meta?: PaginationMeta;
	} = $props();

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

	let deleting = $state<KotobaAdminTopic | null>(null);
	let deleteOpen = $state(false);

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

	let currentLevel = $derived(page.url.searchParams.get('level') ?? 'all');
	let currentCategory = $derived(page.url.searchParams.get('category') ?? 'all');
	let currentStatus = $derived(page.url.searchParams.get('status') ?? 'all');
	let currentSort = $derived(page.url.searchParams.get('sort') ?? 'order');

	function updateFilter(key: 'level' | 'category' | 'status' | 'sort', val: string) {
		const url = new URL(page.url);
		if (val === 'all' || (key === 'sort' && val === 'order')) {
			url.searchParams.delete(key);
		} else {
			url.searchParams.set(key, val);
		}
		url.searchParams.delete('page');
		goto(`${resolve('/(protected)/admin/kotoba')}${url.search}` as ResolvedPathname, {
			keepFocus: true,
			noScroll: true,
			replaceState: true
		});
	}

	const columns = createKotobaAdminColumns((topic) => {
		deleting = topic;
		deleteOpen = true;
	});
</script>

<svelte:head>
	<title>Kotoba | Admin - Gakkobit</title>
	<meta name="description" content="Kelola topik dan kosakata bahasa Jepang." />
</svelte:head>

<div class="flex flex-col space-y-6">
	<ManagementPageHeader title="Kotoba" description="Kelola topik dan susun kosakata untuk siswa." />

	{#if message}
		<p class="admin-notice border-destructive text-destructive" role="alert">
			{message}
		</p>
	{/if}
	{#if kotoba.notice}
		<p
			class="admin-notice border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
			role="status"
		>
			{kotoba.notice}
		</p>
	{/if}

	<DataTable
		data={allTopics}
		{columns}
		{meta}
		getRowAttributes={(row) => ({ 'data-topic-id': row.id })}
		searchPlaceholder="Cari topik..."
		emptyMessage={allTopics.length ? 'Topik tidak ditemukan' : 'Belum ada topik'}
	>
		{#snippet headerActions()}
			<div class="flex w-full items-center justify-between">
				<div class="flex items-center gap-2">
					<ManagementSelect
						aria-label="Filter level JLPT"
						value={currentLevel}
						options={[
							{ value: 'all', label: 'Semua level' },
							...kotobaLevels.map((value) => ({ value, label: value }))
						]}
						class="h-9 bg-background text-muted-foreground sm:w-36"
						onchange={(val: string) => updateFilter('level', val)}
					/>
					<ManagementSelect
						aria-label="Filter kategori"
						value={currentCategory}
						options={[
							{ value: 'all', label: 'Semua kategori' },
							{ value: 'Dasar', label: 'Dasar' },
							{ value: 'Populer', label: 'Populer' },
							{ value: 'Pemula', label: 'Pemula' }
						]}
						class="h-9 bg-background text-muted-foreground sm:w-40"
						onchange={(val: string) => updateFilter('category', val)}
					/>
					<ManagementSelect
						aria-label="Filter status"
						value={currentStatus}
						options={[
							{ value: 'all', label: 'Semua status' },
							{ value: 'active', label: 'Aktif' },
							{ value: 'inactive', label: 'Nonaktif' }
						]}
						class="h-9 bg-background text-muted-foreground sm:w-36"
						onchange={(val: string) => updateFilter('status', val)}
					/>
					<ManagementSelect
						aria-label="Urutkan topik"
						value={currentSort}
						options={[
							{ value: 'order', label: 'Urutan topik' },
							{ value: 'title', label: 'Nama A–Z' }
						]}
						class="h-9 bg-background text-muted-foreground sm:w-36"
						onchange={(val: string) => updateFilter('sort', val)}
					/>
				</div>

				<Button onclick={() => goto(resolve('/(protected)/admin/kotoba/[id]', { id: 'new' }))}>
					<Plus class="size-4" /> Buat Topik
				</Button>
			</div>
		{/snippet}
	</DataTable>
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
