<script lang="ts">
	import type { ResolvedPathname } from '$app/types';
	import { goto, invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { questionKanaTemplatesUseCase } from '$dependencies/question.dependency';
	import type { QuestionKanaTemplateMetadata } from '$features/question/domain/entities/question-kana-template.entity';
	import { HttpError } from '$lib/http/http-error';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Plus } from 'lucide-svelte';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import ManagementSelect from '$lib/components/management-select.svelte';
	import type { QuestionKanaTemplatesData } from '$features/question/presentation/models/question-admin-view.model';
	import { DataTable } from '$lib/components/data-table';
	import { createQuestionAdminKanaTemplatesColumns } from '$features/question/presentation/components/question-admin-kana-templates-columns';

	let { data }: { data: QuestionKanaTemplatesData } = $props();

	let busy = $state(false);
	let message = $state('');
	let notice = $state('');
	let deleting = $state<QuestionKanaTemplateMetadata | null>(null);
	let deleteOpen = $state(false);

	async function removeTemplate() {
		if (!deleting || busy) return;
		busy = true;
		message = '';
		notice = '';
		try {
			await questionKanaTemplatesUseCase.remove(deleting.id);
			notice = `Template “${deleting.character}” (${deleting.source_version}) berhasil dihapus.`;
			deleteOpen = false;
			deleting = null;
			await invalidate('question:kana-templates');
		} catch (cause) {
			message = cause instanceof Error ? cause.message : 'Gagal menghapus template kana.';
			deleteOpen = false;
			deleting = null;
			if (cause instanceof HttpError && cause.status === 401) await goto(resolve('/signin'));
		} finally {
			busy = false;
		}
	}

	const columns = createQuestionAdminKanaTemplatesColumns((template) => {
		deleting = template;
		deleteOpen = true;
	});

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

	{#if message}
		<p class="admin-notice border-destructive text-destructive" role="alert">
			{message}
		</p>
	{/if}
	{#if notice}
		<p
			class="admin-notice border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
			role="status"
		>
			{notice}
		</p>
	{/if}

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

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Hapus template kana?</Dialog.Title>
			<Dialog.Description>
				Template “{deleting?.character}” ({deleting?.source_version}) akan dihapus.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" disabled={busy} onclick={() => (deleteOpen = false)}>Batal</Button>
			<Button variant="destructive" disabled={busy} onclick={removeTemplate}>
				{busy ? 'Menghapus...' : 'Hapus Template'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
