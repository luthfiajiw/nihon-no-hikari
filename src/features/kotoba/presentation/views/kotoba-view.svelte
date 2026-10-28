<script lang="ts">
	import {
		ArrowDownWideNarrowIcon,
		BookOpenIcon,
		ChevronDownIcon,
		SearchIcon
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import { kotobaLevels, type KotobaLevel, type KotobaTopic } from '../../data/kotoba-topics';
	import KotobaHeroBanner from '../components/kotoba-hero-banner.svelte';
	import KotobaTopicCard from '../components/kotoba-topic-card.svelte';

	let { topics }: { topics: KotobaTopic[] } = $props();
	let activeLevel = $state<KotobaLevel>('N5');
	let search = $state('');
	let sort = $state('newest');

	const sortOptions = [
		{ value: 'newest', label: 'Terbaru' },
		{ value: 'title', label: 'Nama A–Z' },
		{ value: 'vocabulary', label: 'Kotoba terbanyak' }
	];
	const sortLabel = $derived(sortOptions.find((option) => option.value === sort)?.label);
	const levelTopics = $derived(topics.filter((topic) => topic.level === activeLevel));
	const filteredTopics = $derived.by(() => {
		const query = search.trim().toLocaleLowerCase('id');
		return levelTopics
			.filter((topic) =>
				`${topic.title} ${topic.description}`.toLocaleLowerCase('id').includes(query)
			)
			.sort((a, b) => {
				if (sort === 'title') return a.title.localeCompare(b.title, 'id');
				if (sort === 'vocabulary') return b.vocabularyCount - a.vocabularyCount;
				return b.createdAt - a.createdAt;
			});
	});
</script>

<div class="flex flex-col gap-6 p-4 pb-8 sm:p-6 sm:pb-10">
	<KotobaHeroBanner />

	<div class="flex flex-wrap gap-3" role="group" aria-label="Filter level JLPT">
		{#each kotobaLevels as level (level)}
			<Button
				variant={activeLevel === level ? 'default' : 'outline'}
				class="min-w-14"
				aria-pressed={activeLevel === level}
				aria-controls="kotoba-topics"
				onclick={() => (activeLevel = level)}
			>
				{level}
			</Button>
		{/each}
	</div>

	<section id="kotoba-topics" aria-labelledby="kotoba-topics-title" class="flex flex-col gap-6">
		<div class="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
			<div class="flex flex-col">
				<h2 id="kotoba-topics-title" class="text-xl font-bold tracking-tight">Topik Kosakata</h2>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Daftar topik kosakata untuk level {activeLevel} berdasarkan tema pembelajaran.
				</p>
			</div>
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center xl:shrink-0">
				<div class="relative min-w-0 sm:flex-1 xl:w-64">
					<SearchIcon
						class="-trantaupe-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground"
						aria-hidden="true"
					/>
					<Input
						type="search"
						bind:value={search}
						aria-label="Cari topik kosakata"
						placeholder="Cari topik kosakata..."
						class="h-10 bg-card pl-9 focus-visible:ring-2 focus-visible:ring-ring"
					/>
				</div>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button
								variant="outline"
								data-flat
								class="self-start border-border text-xs sm:self-center sm:text-sm"
								{...props}
							>
								<ArrowDownWideNarrowIcon class="size-4" aria-hidden="true" />
								Urutkan: {sortLabel}
								<ChevronDownIcon class="size-3.5" aria-hidden="true" />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" class="w-48">
						<DropdownMenu.RadioGroup bind:value={sort}>
							{#each sortOptions as option (option.value)}
								<DropdownMenu.RadioItem value={option.value}>
									{option.label}
								</DropdownMenu.RadioItem>
							{/each}
						</DropdownMenu.RadioGroup>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</div>

		{#if filteredTopics.length > 0}
			<div class="grid grid-cols-4 gap-6 pb-1">
				{#each filteredTopics as topic (topic.id)}
					<KotobaTopicCard {topic} />
				{/each}
			</div>
			{#if search.trim()}
				<p class="text-xs text-muted-foreground" role="status">
					Menampilkan {filteredTopics.length} dari {levelTopics.length} topik.
				</p>
			{/if}
		{:else}
			<div
				class="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-14 text-center"
				role="status"
			>
				<div
					class="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
				>
					{#if search.trim()}
						<SearchIcon class="size-6" aria-hidden="true" />
					{:else}
						<BookOpenIcon class="size-6" aria-hidden="true" />
					{/if}
				</div>
				<h3 class="text-base font-semibold">
					{search.trim() ? 'Topik tidak ditemukan' : `Belum ada topik di level ${activeLevel}`}
				</h3>
				<p class="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
					{search.trim()
						? 'Coba kata kunci lain atau hapus pencarian untuk melihat semua topik.'
						: 'Topik kosakata untuk level ini belum tersedia.'}
				</p>
				{#if search.trim()}
					<Button variant="outline" class="mt-5" onclick={() => (search = '')}>
						Hapus pencarian
					</Button>
				{/if}
			</div>
		{/if}
	</section>
</div>
