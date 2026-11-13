<script lang="ts">
	import type { ResolvedPathname } from '$app/types';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from 'lucide-svelte';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import ManagementSelect from '$lib/components/management-select.svelte';
	import type { QuestionKanaTemplatesData } from '$features/question/presentation/models/question-admin-view.model';
	import { DataTable } from '$lib/components/data-table';
	import { questionAdminKanaTemplatesColumns as columns } from '$features/question/presentation/components/question-admin-kana-templates-columns';

	let { data }: { data: QuestionKanaTemplatesData } = $props();

	const currentScript = $derived(page.url.searchParams.get('script') ?? 'all');

	function updateFilter(key: 'script', val: string) {
		const url = new URL(page.url);
		if (val === 'all') {
			url.searchParams.delete(key);
		} else {
			url.searchParams.set(key, val);
		}
		url.searchParams.delete('page');
		goto(`${resolve('/(protected)/admin/kana-templates')}${url.search}` as ResolvedPathname, {
			keepFocus: true,
			noScroll: true,
			replaceState: true
		});
	}
</script>

<svelte:head>
	<title>Template Kana | Admin - Gakkobit</title>
	<meta name="description" content="Kelola panduan goresan hiragana dan katakana dari KanjiVG." />
</svelte:head>

<div class="flex flex-col space-y-6">
	<ManagementPageHeader
		title="Template Kana"
		description="Panduan goresan hiragana dan katakana untuk latihan menulis."
	/>

	<DataTable
		data={data.templates}
		{columns}
		meta={data.meta}
		searchPlaceholder="Cari template kana..."
		emptyMessage={currentScript !== 'all' ||
		Boolean(page.url.searchParams.get('search') ?? page.url.searchParams.get('q'))
			? 'Template tidak ditemukan.'
			: 'Belum ada template kana. Tambahkan SVG KanjiVG untuk mulai.'}
	>
		{#snippet headerActions()}
			<div class="flex w-full items-center justify-between">
				<ManagementSelect
					aria-label="Filter script"
					id="kana-script-filter"
					value={currentScript}
					onchange={(val: string) => updateFilter('script', val)}
					class="h-9 bg-background text-muted-foreground sm:w-36"
					options={[
						{ value: 'all', label: 'Semua script' },
						{ value: 'hiragana', label: 'Hiragana' },
						{ value: 'katakana', label: 'Katakana' }
					]}
				/>
				<Button
					onclick={() => goto(resolve('/(protected)/admin/kana-templates/[id]', { id: 'new' }))}
				>
					<Plus class="size-4" /> Tambah Template
				</Button>
			</div>
		{/snippet}
	</DataTable>
</div>
