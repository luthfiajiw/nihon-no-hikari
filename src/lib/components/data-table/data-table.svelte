<script lang="ts" generics="TData extends Record<string, any>, TValue = unknown">
	import {
		createTable,
		tableFeatures,
		rowSortingFeature,
		createSortedRowModel,
		FlexRender,
		type ColumnDef,
		type SortingState
	} from '@tanstack/svelte-table';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import * as Table from '$lib/components/ui/table';
	import * as Pagination from '$lib/components/ui/pagination';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import SearchIcon from '@lucide/svelte/icons/search';
	import XIcon from '@lucide/svelte/icons/x';
	import type { PaginationMeta } from '$lib/models/pagination.model';
	import { cn } from '$lib/utils';

	let {
		data,
		columns,
		meta,
		searchPlaceholder = 'Cari data...',
		emptyMessage = 'Tidak ada data yang ditemukan.',
		searchParamKey = 'search',
		getRowAttributes,
		class: className,
		tableClass,
		showSearch = true,
		showPagination = true
	}: {
		data: TData[];
		columns: ColumnDef<any, TData, any>[];
		meta?: PaginationMeta;
		searchPlaceholder?: string;
		emptyMessage?: string;
		searchParamKey?: string;
		getRowAttributes?: (row: TData) => Record<string, string | number | boolean | undefined | null>;
		class?: string;
		tableClass?: string;
		showSearch?: boolean;
		showPagination?: boolean;
	} = $props();

	let sorting = $state<SortingState>([]);

	const features = tableFeatures({ rowSortingFeature, createSortedRowModel });

	const table = createTable({
		features,
		get columns() {
			return columns;
		},
		get data() {
			return data;
		},
		state: {
			get sorting() {
				return sorting;
			}
		},
		onSortingChange: (updater) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
		}
	});

	const initialSearch = $derived(
		page.url.searchParams.get(searchParamKey) ?? page.url.searchParams.get('q') ?? ''
	);

	let searchValue = $state('');
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		searchValue = initialSearch;
	});

	function updateUrl(params: Record<string, string | number | null>) {
		const url = new URL(page.url);
		for (const [key, value] of Object.entries(params)) {
			if (value === null || value === '' || (key === 'page' && value === 1)) {
				url.searchParams.delete(key);
			} else {
				url.searchParams.set(key, String(value));
			}
		}
		if (params[searchParamKey] !== undefined) {
			url.searchParams.delete('q');
		}
		goto(url.toString(), {
			keepFocus: true,
			noScroll: true,
			replaceState: true
		});
	}

	function handleSearchInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchValue = target.value;
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			updateUrl({
				[searchParamKey]: searchValue.trim() || null,
				page: 1
			});
		}, 300);
	}

	function handleClearSearch() {
		searchValue = '';
		if (debounceTimer) clearTimeout(debounceTimer);
		updateUrl({
			[searchParamKey]: null,
			page: 1
		});
	}

	function handlePageChange(newPage: number) {
		updateUrl({ page: newPage });
	}

	function handleLimitChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		const newLimit = parseInt(target.value, 10) || 10;
		updateUrl({
			limit: newLimit,
			page: 1
		});
	}

	const displayMeta = $derived.by(() => {
		if (meta) return meta;
		return {
			page: 1,
			limit: data.length || 10,
			total: data.length,
			total_pages: 1
		};
	});

	const startRow = $derived(
		displayMeta.total === 0 ? 0 : (displayMeta.page - 1) * displayMeta.limit + 1
	);
	const endRow = $derived(Math.min(displayMeta.page * displayMeta.limit, displayMeta.total));
</script>

<div class={cn('flex flex-col gap-4', className)}>
	{#if showSearch}
		<div class="flex items-center justify-between gap-4">
			<div class="relative max-w-sm flex-1">
				<SearchIcon
					class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					type="search"
					value={searchValue}
					placeholder={searchPlaceholder}
					class="pl-9 pr-9"
					oninput={handleSearchInput}
				/>
				{#if searchValue}
					<Button
						type="button"
						variant="ghost"
						size="sm"
						class="absolute top-1/2 right-1 size-7 -translate-y-1/2 p-0 text-muted-foreground hover:text-foreground"
						onclick={handleClearSearch}
					>
						<XIcon class="size-3.5" />
						<span class="sr-only">Hapus pencarian</span>
					</Button>
				{/if}
			</div>
		</div>
	{/if}

	<div class="rounded-md border bg-card">
		<Table.Root class={tableClass}>
			<Table.Header>
				{#each table.getHeaderGroups() as group (group.id)}
					<Table.Row>
						{#each group.headers as header (header.id)}
							<Table.Head>
								{#if !header.isPlaceholder}
									<FlexRender {header} />
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#if table.getRowModel().rows.length === 0}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center text-muted-foreground">
							{emptyMessage}
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each table.getRowModel().rows as row (row.id)}
						<Table.Row {...(getRowAttributes ? getRowAttributes(row.original as TData) : {})}>
							{#each row.getAllCells() as cell (cell.id)}
								<Table.Cell>
									<FlexRender {cell} />
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	{#if showPagination && displayMeta.total > 0}
		<div
			class="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-2 text-sm text-muted-foreground"
		>
			<div class="flex items-center gap-3">
				<span>
					Menampilkan <span class="font-medium text-foreground">{startRow}</span>
					- <span class="font-medium text-foreground">{endRow}</span>
					dari <span class="font-medium text-foreground">{displayMeta.total}</span> data
				</span>
				<div class="flex items-center gap-1.5 text-xs">
					<label for="page-size-select" class="text-muted-foreground">Per halaman:</label>
					<select
						id="page-size-select"
						class="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						value={displayMeta.limit}
						onchange={handleLimitChange}
					>
						<option value={10}>10</option>
						<option value={20}>20</option>
						<option value={50}>50</option>
					</select>
				</div>
			</div>

			<div class="flex items-center">
				<Pagination.Root
					count={displayMeta.total}
					perPage={displayMeta.limit}
					page={displayMeta.page}
					onPageChange={handlePageChange}
				>
					{#snippet children({ pages, range: _range })}
						<Pagination.Content>
							<Pagination.Item>
								<Pagination.Previous />
							</Pagination.Item>
							{#each pages as p (p.key)}
								{#if p.type === 'ellipsis'}
									<Pagination.Item>
										<Pagination.Ellipsis />
									</Pagination.Item>
								{:else}
									<Pagination.Item>
										<Pagination.Link page={p} isActive={displayMeta.page === p.value}>
											{p.value}
										</Pagination.Link>
									</Pagination.Item>
								{/if}
							{/each}
							<Pagination.Item>
								<Pagination.Next />
							</Pagination.Item>
						</Pagination.Content>
					{/snippet}
				</Pagination.Root>
			</div>
		</div>
	{/if}
</div>
