<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { kotobaRepository } from '$dependencies/kotoba.dependency';
	import { KotobaError } from '$features/kotoba/domain/entities/kotoba-api.entity';
	import { mediaNeedsRefresh } from '$features/kotoba/presentation/models/kotoba-api.model';
	import { resolve } from '$app/paths';
	import type { ResolvedPathname } from '$app/types';
	import { BookOpen, EyeOff, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { kotobaLevels } from '$features/kotoba/data/kotoba-topics';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import ManagementSelect from '$lib/components/management-select.svelte';
	import { getKotobaAdminState } from '$features/kotoba/presentation/contexts/kotoba-admin-context.svelte';
	import type { KotobaAdminTopic } from '$features/kotoba/presentation/models/kotoba-admin.model';
	import type { PaginationMeta } from '$lib/models/pagination.model';
	import {
		DataTable,
		DataTableColumnHeader,
		type DataTableColumn,
		type DataTableColumnDef
	} from '$lib/components/data-table';
	import { renderSnippet } from '@tanstack/svelte-table';

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
	let currentStatus = $derived(page.url.searchParams.get('status') ?? 'all');
	let currentSort = $derived(page.url.searchParams.get('sort') ?? 'order');

	function updateFilter(key: 'level' | 'status' | 'sort', val: string) {
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

	const columns: DataTableColumnDef<KotobaAdminTopic>[] = [
		{
			accessorKey: 'title',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Topik' }),
			cell: ({ row }) => renderSnippet(titleCell, { row: row.original })
		},
		{
			accessorKey: 'level',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Level' }),
			cell: ({ row }) => renderSnippet(levelCell, { row: row.original })
		},
		{
			accessorKey: 'vocabularyCount',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Kosakata' }),
			cell: ({ row }) => renderSnippet(vocabCell, { row: row.original })
		},
		{
			accessorKey: 'order',
			header: ({ column }) => renderSnippet(headerSnippet, { column, title: 'Urutan' }),
			cell: ({ row }) => renderSnippet(orderCell, { row: row.original })
		},
		{
			accessorKey: 'active',
			header: 'Status',
			cell: ({ row }) => renderSnippet(statusCell, { row: row.original }),
			enableSorting: false
		},
		{
			id: 'actions',
			header: () => renderSnippet(actionsHeaderSnippet, {}),
			cell: ({ row }) => renderSnippet(actionsCell, { row: row.original }),
			enableSorting: false
		}
	];
</script>

{#snippet headerSnippet({
	column,
	title
}: {
	column: DataTableColumn<KotobaAdminTopic>;
	title: string;
})}
	<DataTableColumnHeader {column} {title} />
{/snippet}

{#snippet actionsHeaderSnippet()}
	<div class="text-right">Aksi</div>
{/snippet}

{#snippet titleCell({ row }: { row: KotobaAdminTopic })}
	<div class="max-w-xs min-w-0 space-y-1 sm:max-w-md">
		<button
			type="button"
			class="block w-full truncate text-left font-semibold text-foreground transition-colors hover:text-primary"
			onclick={() => goto(resolve('/(protected)/admin/kotoba/[id]', { id: row.id }))}
		>
			{row.title}
		</button>
		{#if row.description}
			<p class="line-clamp-2 text-xs text-muted-foreground">{row.description}</p>
		{/if}
	</div>
{/snippet}

{#snippet levelCell({ row }: { row: KotobaAdminTopic })}
	<div class="flex flex-wrap items-center gap-1.5">
		<Badge>{row.level}</Badge>
		<Badge variant="secondary">{row.category}</Badge>
	</div>
{/snippet}

{#snippet vocabCell({ row }: { row: KotobaAdminTopic })}
	<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
		<BookOpen class="size-3.5" />
		<span>{row.vocabularyCount ?? row.vocabulary.length} kosakata</span>
	</div>
{/snippet}

{#snippet orderCell({ row }: { row: KotobaAdminTopic })}
	<span class="text-xs text-muted-foreground">Urutan {row.order}</span>
{/snippet}

{#snippet statusCell({ row }: { row: KotobaAdminTopic })}
	<div class="flex flex-wrap items-center gap-1.5">
		<Badge
			variant="outline"
			class={row.active
				? 'border-emerald-300 text-emerald-700 dark:text-emerald-300'
				: 'text-muted-foreground'}
		>
			{row.active ? 'Aktif' : 'Nonaktif'}
		</Badge>
		{#if !row.visible}
			<span class="flex items-center gap-1 text-xs text-muted-foreground">
				<EyeOff class="size-3" /> Disembunyikan
			</span>
		{/if}
	</div>
{/snippet}

{#snippet actionsCell({ row }: { row: KotobaAdminTopic })}
	<div class="flex items-center justify-end">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button
						variant="outline"
						size="icon-sm"
						aria-label={`Aksi topik ${row.title}`}
						{...props}
					>
						<MoreVertical />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-40">
				<DropdownMenu.Group>
					<DropdownMenu.Item
						aria-label={`Edit topik ${row.title}`}
						onclick={() => goto(resolve('/(protected)/admin/kotoba/[id]', { id: row.id }))}
					>
						<Pencil />
						Edit
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item
						variant="destructive"
						aria-label={`Hapus topik ${row.title}`}
						onclick={() => {
							deleting = row;
							deleteOpen = true;
						}}
					>
						<Trash2 />
						Hapus
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
{/snippet}

<svelte:head>
	<title>Kotoba | Admin - Gakkobit</title>
	<meta name="description" content="Kelola topik dan kosakata bahasa Jepang." />
</svelte:head>

<div class="admin-page">
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
