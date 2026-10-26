<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { kotobaRepository } from '$dependencies/kotoba.dependency';
	import { mediaNeedsRefresh, topicDetail } from '../models/kotoba-api.model';
	import { KotobaPlayer } from '../kotoba-player';
	import {
		ArrowDownWideNarrowIcon,
		ArrowLeftIcon,
		ChevronDownIcon,
		SearchIcon
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import {
		kotobaTypes,
		type KotobaTopicDetail,
		type KotobaType,
		type KotobaVocabulary
	} from '../../data/kotoba-topic-detail';
	import KotobaTopicHeroBanner from '../components/kotoba-topic-hero-banner.svelte';
	import KotobaVocabularyCard from '../components/kotoba-vocabulary-card.svelte';

	let { topic: initial }: { topic: KotobaTopicDetail } = $props();
	let topic = $state(untrack(() => initial));
	let activeType = $state<KotobaType | 'Semua'>('Semua');
	let search = $state('');
	let sort = $state('default');
	let speechAvailable = $state(false);
	let playingId = $state<string | null>(null);
	let playingAll = $state(false);
	let speechMessage = $state('');
	let audioAvailable = $state(false);
	let player: KotobaPlayer | undefined;
	let disposed = false;
	let refreshing: Promise<void> | null = null;

	const sortOptions = [
		{ value: 'default', label: 'Default' },
		{ value: 'romaji', label: 'Romaji A–Z' },
		{ value: 'translation', label: 'Arti A–Z' }
	];
	const sortLabel = $derived(sortOptions.find((option) => option.value === sort)?.label);
	const typeFilters = $derived([
		{ type: 'Semua' as const, count: topic.vocabulary.length },
		...kotobaTypes.map((type) => ({
			type,
			count: topic.vocabulary.filter((word) => word.type === type).length
		}))
	]);
	const filteredVocabulary = $derived.by(() => {
		const query = search.trim().toLocaleLowerCase('id');
		return topic.vocabulary
			.filter((word) => activeType === 'Semua' || word.type === activeType)
			.filter((word) =>
				[
					word.kanji,
					word.hiragana,
					word.romaji,
					word.translation,
					word.example.japanese,
					word.example.indonesian
				].some((value) => value.toLocaleLowerCase('id').includes(query))
			)
			.sort((a, b) => {
				if (sort === 'romaji') return a.romaji.localeCompare(b.romaji, 'id');
				if (sort === 'translation') return a.translation.localeCompare(b.translation, 'id');
				return 0;
			});
	});

	function stopPlayback(): void {
		player?.stop();
	}

	function playVocabulary(words: KotobaVocabulary[], all = false): void {
		void player?.play(
			words.map((word) => word.id),
			all
		);
	}
	async function refreshMedia() {
		if (!topic.id || !mediaNeedsRefresh(topic.mediaExpiresAt)) return;
		if (!refreshing)
			refreshing = kotobaRepository
				.detail(topic.id, false)
				.then((record) => {
					if (!disposed) topic = topicDetail(record);
				})
				.finally(() => {
					refreshing = null;
				});
		await refreshing;
	}
	function canPlay(word: KotobaVocabulary) {
		return !!(word.audioUrl && audioAvailable) || speechAvailable;
	}

	onMount(() => {
		disposed = false;
		audioAvailable = typeof Audio !== 'undefined';
		speechAvailable = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
		if (speechAvailable) window.speechSynthesis.getVoices();
		player = new KotobaPlayer(
			(state) => {
				playingId = state.playingId;
				playingAll = state.playingAll;
				speechMessage = state.message;
			},
			async (id) => {
				await refreshMedia();
				return topic.vocabulary.find((word) => word.id === id);
			}
		);
		async function refresh() {
			try {
				await refreshMedia();
			} catch (cause) {
				if (!disposed) {
					stopPlayback();
					speechMessage = cause instanceof Error ? cause.message : 'Media belum dapat diperbarui.';
				}
			}
		}
		const timer = window.setInterval(() => void refresh(), 60_000);
		window.addEventListener('focus', refresh);
		return () => {
			disposed = true;
			window.clearInterval(timer);
			window.removeEventListener('focus', refresh);
			stopPlayback();
		};
	});
</script>

<div class="flex min-w-0 flex-col gap-6 p-4 pb-8 sm:p-6 sm:pb-10">
	<Button variant="outline" size="icon" type="button" onclick={() => window.history.back()}>
		<ArrowLeftIcon />
	</Button>

	<KotobaTopicHeroBanner
		{topic}
		{playingAll}
		playbackDisabled={!filteredVocabulary.some(canPlay)}
		onTogglePlayback={() =>
			playingAll ? stopPlayback() : playVocabulary(filteredVocabulary, true)}
	/>

	<section aria-label="Daftar kosakata" class="flex min-w-0 flex-col gap-5">
		<div class="flex flex-col justify-between gap-4 2xl:flex-row 2xl:items-center">
			<div class="flex flex-wrap gap-2.5" role="group" aria-label="Filter jenis kosakata">
				{#each typeFilters as filter (filter.type)}
					<Button
						variant={activeType === filter.type ? 'default' : 'outline'}
						class="h-9 px-3 text-xs"
						aria-pressed={activeType === filter.type}
						aria-controls="kotoba-vocabulary"
						onclick={() => {
							stopPlayback();
							activeType = filter.type;
						}}
					>
						{filter.type} ({filter.count})
					</Button>
				{/each}
			</div>
			<div class="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center 2xl:shrink-0">
				<div class="relative min-w-0 sm:max-w-sm sm:flex-1 2xl:w-56">
					<SearchIcon
						class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
						aria-hidden="true"
					/>
					<Input
						type="search"
						bind:value={search}
						oninput={stopPlayback}
						aria-label="Cari kosakata"
						placeholder="Cari kosakata..."
						class="h-10 bg-card pl-9"
					/>
				</div>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button
								variant="outline"
								data-flat
								class="self-start border-border text-xs sm:text-sm"
								{...props}
							>
								<ArrowDownWideNarrowIcon class="size-4" aria-hidden="true" />
								Urutkan: {sortLabel}
								<ChevronDownIcon class="size-3.5" aria-hidden="true" />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" class="w-48">
						<DropdownMenu.RadioGroup bind:value={sort} onValueChange={stopPlayback}>
							{#each sortOptions as option (option.value)}
								<DropdownMenu.RadioItem value={option.value}>{option.label}</DropdownMenu.RadioItem>
							{/each}
						</DropdownMenu.RadioGroup>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</div>

		{#if speechMessage}
			<p
				class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
				role="status"
			>
				{speechMessage}
			</p>
		{:else if !speechAvailable && !topic.vocabulary.some((word) => word.audioUrl)}
			<p class="text-sm text-muted-foreground" role="status">
				Pelafalan suara tidak tersedia di browser ini.
			</p>
		{/if}

		<div id="kotoba-vocabulary" class="grid min-w-0 grid-cols-1 gap-5 pb-1 xl:grid-cols-2">
			{#each filteredVocabulary as vocabulary (vocabulary.id)}
				<KotobaVocabularyCard
					{vocabulary}
					number={topic.vocabulary.indexOf(vocabulary) + 1}
					isPlaying={playingId === vocabulary.id}
					speechAvailable={canPlay(vocabulary)}
					onPlay={() =>
						playingId === vocabulary.id ? stopPlayback() : playVocabulary([vocabulary])}
				/>
			{:else}
				<div
					class="flex flex-col items-center rounded-2xl border border-dashed px-6 py-14 text-center xl:col-span-2"
					role="status"
				>
					<SearchIcon class="mb-4 size-8 text-muted-foreground" aria-hidden="true" />
					<h2 class="text-base font-semibold">Kosakata tidak ditemukan</h2>
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
						Coba kata kunci atau jenis kata lain untuk melihat kosakata.
					</p>
					<Button
						variant="outline"
						class="mt-5"
						onclick={() => {
							search = '';
							activeType = 'Semua';
						}}
					>
						Reset filter
					</Button>
				</div>
			{/each}
		</div>
		<p class="text-xs text-muted-foreground" role="status" aria-live="polite">
			Menampilkan {filteredVocabulary.length} dari {topic.vocabulary.length} kosakata.
		</p>
	</section>
</div>
