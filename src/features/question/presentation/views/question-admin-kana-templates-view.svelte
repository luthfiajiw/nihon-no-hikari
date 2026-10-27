<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Pencil, Plus } from 'lucide-svelte';
	import ManagementPageHeader from '$lib/components/management-page-header.svelte';
	import ManagementSelect from '$lib/components/management-select.svelte';
	import type { QuestionKanaTemplateMetadata } from '$features/question/domain/entities/question-kana-template.entity';
	let { data }: { data: { templates: QuestionKanaTemplateMetadata[] } } = $props();
	let search = $state('');
	let script = $state('all');
	const filtered = $derived(
		data.templates.filter(
			(item) =>
				(script === 'all' || item.script === script) &&
				`${item.character} ${item.romaji}`
					.toLocaleLowerCase()
					.includes(search.trim().toLocaleLowerCase())
		)
	);
</script>

<svelte:head>
	<title>Template Kana | Admin - Gakkobit</title>
	<meta name="description" content="Kelola panduan goresan hiragana dan katakana dari KanjiVG." />
</svelte:head>

<div class="admin-page">
	<ManagementPageHeader
		title="Template Kana"
		description="Panduan goresan hiragana dan katakana untuk latihan menulis."
	>
		{#snippet actions()}
			<Button
				onclick={() => goto(resolve('/(protected)/admin/kana-templates/[id]', { id: 'new' }))}
			>
				<Plus class="size-4" /> Tambah Template
			</Button>
		{/snippet}
	</ManagementPageHeader>
	<Card.Root size="sm" class="px-(--card-spacing)">
		<div class="admin-fields">
			<div class="flex flex-col space-y-1 text-sm font-medium">
				<label for="kana-script-filter">Filter</label>
				<ManagementSelect
					id="kana-script-filter"
					bind:value={script}
					options={[
						{ value: 'all', label: 'Semua script' },
						{ value: 'hiragana', label: 'Hiragana' },
						{ value: 'katakana', label: 'Katakana' }
					]}
				/>
			</div>
		</div>
	</Card.Root>
	<Card.Root class="gap-0 py-0">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead class="border-b bg-muted text-muted-foreground">
					<tr>
						<th class="admin-row">Karakter</th>
						<th class="admin-row">Script</th>
						<th class="admin-row">Romaji</th>
						<th class="admin-row">Versi sumber</th>
						<th class="admin-row">Goresan</th>
						<th class="admin-row">Aksi</th>
					</tr>
				</thead>
				<tbody>
					{#each filtered as item (item.id)}
						<tr class="border-b last:border-0">
							<td class="admin-row text-3xl">{item.character}</td>
							<td class="admin-row capitalize">{item.script}</td>
							<td class="admin-row">{item.romaji}</td>
							<td class="admin-row">{item.source_version}</td>
							<td class="admin-row">{item.stroke_count}</td>
							<td class="admin-row">
								<Button
									variant="outline"
									size="icon"
									aria-label={`Edit template ${item.character} ${item.source_version}`}
									onclick={() =>
										goto(resolve('/(protected)/admin/kana-templates/[id]', { id: item.id }))}
								>
									<Pencil class="size-4" />
								</Button>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="6" class="admin-row py-10 text-center text-muted-foreground">
								{data.templates.length
									? 'Template tidak ditemukan.'
									: 'Belum ada template kana. Tambahkan SVG KanjiVG untuk mulai.'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Card.Root>
</div>
