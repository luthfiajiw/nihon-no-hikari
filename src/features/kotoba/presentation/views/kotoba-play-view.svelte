<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { page } from '$app/state';
	import { kotobaRepository } from '$dependencies/kotoba.dependency';
	import { mediaNeedsRefresh, topicDetail } from '../models/kotoba-api.model';
	import { KotobaPlayer } from '../kotoba-player';
	import {
		filterKotobaVocabulary,
		kotobaTypeBadgeClasses,
		parseKotobaVocabularyQuery
	} from '../models/kotoba-vocabulary.model';
	import {
		ArrowLeftIcon,
		PauseIcon,
		PlayIcon,
		SkipBackIcon,
		SkipForwardIcon,
		Volume2Icon
	} from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Separator } from '$lib/components/ui/separator';
	import {
		kotobaTypeLabels,
		type KotobaTopicDetail,
		type KotobaVocabulary
	} from '../../data/kotoba-topic-detail';
	import { cn } from '$lib/utils';

	let { topic: initial }: { topic: KotobaTopicDetail } = $props();
	let topic = $state(untrack(() => initial));

	let currentIndex = $state(0);
	let isPlaying = $state(false);
	let speechMessage = $state('');
	let speechAvailable = $state(false);
	let audioAvailable = $state(false);
	let player: KotobaPlayer | undefined;
	let disposed = false;
	let refreshing: Promise<void> | null = null;

	const query = $derived(parseKotobaVocabularyQuery(page.url.searchParams));
	const items = $derived(filterKotobaVocabulary(topic.vocabulary, query));
	const currentWord = $derived<KotobaVocabulary | undefined>(items[currentIndex]);

	const paddedCurrent = $derived(String(currentIndex + 1).padStart(2, '0'));
	const paddedTotal = $derived(String(Math.max(items.length, 1)).padStart(2, '0'));
	const topicWordNumber = $derived(
		currentWord ? topic.vocabulary.indexOf(currentWord) + 1 : currentIndex + 1
	);

	function canPlay(word?: KotobaVocabulary): boolean {
		if (!word) return false;
		return Boolean(word.audioUrl && audioAvailable) || speechAvailable;
	}

	async function refreshMedia(): Promise<void> {
		if (!topic.id || !mediaNeedsRefresh(topic.mediaExpiresAt)) return;
		if (!refreshing) {
			refreshing = kotobaRepository
				.detail(topic.id, false)
				.then((record) => {
					if (!disposed) topic = topicDetail(record);
				})
				.finally(() => {
					refreshing = null;
				});
		}
		await refreshing;
	}

	function stopPlayback(): void {
		player?.stop();
		isPlaying = false;
	}

	function startPlaylistFrom(index: number): void {
		if (!player || items.length === 0) return;
		const targetIndex = Math.min(Math.max(0, index), items.length - 1);
		currentIndex = targetIndex;
		isPlaying = true;

		const remainingIds = items.slice(targetIndex).map((w) => w.id);
		void player
			.playSequence(remainingIds, {
				delayMs: 800,
				onStep: (id) => {
					const idx = items.findIndex((w) => w.id === id);
					if (idx !== -1) currentIndex = idx;
				}
			})
			.then((result) => {
				if (disposed) return;
				if (result === 'completed' || result === 'blocked' || result === 'cancelled') {
					isPlaying = false;
				}
			});
	}

	function togglePlayPause(): void {
		if (isPlaying) {
			stopPlayback();
		} else {
			const nextIndex = currentIndex >= items.length - 1 ? 0 : currentIndex;
			startPlaylistFrom(nextIndex);
		}
	}

	function goPrevious(): void {
		if (currentIndex <= 0) return;
		const nextIndex = currentIndex - 1;
		if (isPlaying) {
			startPlaylistFrom(nextIndex);
		} else {
			stopPlayback();
			currentIndex = nextIndex;
		}
	}

	function goNext(): void {
		if (currentIndex >= items.length - 1) return;
		const nextIndex = currentIndex + 1;
		if (isPlaying) {
			startPlaylistFrom(nextIndex);
		} else {
			stopPlayback();
			currentIndex = nextIndex;
		}
	}

	function replayCurrentWord(): void {
		if (!currentWord || !canPlay(currentWord)) return;
		stopPlayback();
		void player?.play([currentWord.id]);
	}

	function handleKeydown(event: KeyboardEvent): void {
		const target = event.target as HTMLElement | null;
		if (
			target &&
			(target.tagName === 'INPUT' ||
				target.tagName === 'TEXTAREA' ||
				target.tagName === 'SELECT' ||
				target.isContentEditable)
		) {
			return;
		}

		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			goPrevious();
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			goNext();
		} else if (event.key === ' ' || event.code === 'Space') {
			if (target && target.tagName === 'BUTTON') return;
			event.preventDefault();
			togglePlayPause();
		}
	}

	onMount(() => {
		disposed = false;
		audioAvailable = typeof Audio !== 'undefined';
		speechAvailable = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
		if (speechAvailable) window.speechSynthesis.getVoices();

		player = new KotobaPlayer(
			(state) => {
				speechMessage = state.message;
				if (!state.playingAll && state.playingId === null) {
					// Single word or stopped
				}
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
		window.addEventListener('keydown', handleKeydown);

		// Autostart continuous playlist on route entry
		if (items.length > 0) {
			startPlaylistFrom(0);
		}

		return () => {
			disposed = true;
			window.clearInterval(timer);
			window.removeEventListener('focus', refresh);
			window.removeEventListener('keydown', handleKeydown);
			stopPlayback();
		};
	});
	function navigateBack(): void {
		stopPlayback();
		if (topic.id) {
			void goto(resolve(`/kotoba/${topic.id}` as Pathname));
		} else {
			void goto(resolve('/kotoba'));
		}
	}
</script>

<div class="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-5 p-4 pb-10 sm:p-6 sm:pb-12">
	<div class="flex items-center justify-between gap-3">
		<Button
			variant="outline"
			size="icon"
			type="button"
			aria-label="Kembali ke detail topik"
			onclick={navigateBack}
		>
			<ArrowLeftIcon />
		</Button>

		<div class="flex items-center gap-2">
			<Badge variant="secondary" class="font-medium">
				{items.length} Kosakata
			</Badge>
			{#if query.type !== 'Semua'}
				<Badge variant="outline">
					{kotobaTypeLabels[query.type]}
				</Badge>
			{/if}
			{#if query.search.trim()}
				<Badge variant="outline" class="max-w-40 truncate">
					"{query.search.trim()}"
				</Badge>
			{/if}
		</div>
	</div>

	{#if items.length === 0}
		<Card.Root class="py-16 text-center">
			<Card.Content class="flex flex-col items-center gap-4">
				<h2 class="text-xl font-bold">Tidak ada kosakata yang dapat diputar</h2>
				<p class="max-w-md text-sm text-muted-foreground">
					Filter atau pencarian saat ini tidak menghasilkan kosakata pada topik ini.
				</p>
				<Button variant="outline" type="button" onclick={navigateBack}>Kembali ke Topik</Button>
			</Card.Content>
		</Card.Root>
	{:else if currentWord}
		<Card.Root
			class="flex min-h-[580px] flex-col justify-between overflow-hidden sm:min-h-[640px]"
			aria-live="polite"
		>
			<!-- Top Brand & Progress Header (Reference UI Top Bar) -->
			<Card.Header class="pb-2">
				<div class="flex items-center justify-between gap-4">
					<div class="flex items-center gap-2.5">
						<Badge class="px-2.5 py-1 text-xs font-bold tracking-wider">{topic.level}</Badge>
						<Card.Title class="text-xs font-bold tracking-widest text-primary uppercase sm:text-sm">
							{topic.title}
						</Card.Title>
					</div>
					<div class="flex items-center gap-2">
						<span
							class="text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:text-sm"
						>
							KOSAKATA {paddedCurrent} / {paddedTotal}
						</span>
					</div>
				</div>

				<Separator orientation="horizontal" class="my-2 h-px w-full" />

				<div class="flex items-center justify-between gap-3 pt-1">
					<div class="flex flex-col">
						<span class="text-xs font-bold tracking-widest text-muted-foreground uppercase">
							KOTOBA #{topicWordNumber}
						</span>
						<span class="text-sm font-medium text-foreground/80 sm:text-base">
							{currentWord.hiragana}
						</span>
					</div>
					<Badge
						variant="outline"
						class={cn(
							'text-xs font-medium whitespace-nowrap',
							kotobaTypeBadgeClasses[currentWord.type]
						)}
					>
						{kotobaTypeLabels[currentWord.type]}
					</Badge>
				</div>
			</Card.Header>

			<!-- Central Vocabulary Stage (Mirrors the Japanese Suki Reference Layout) -->
			<Card.Content
				class="my-auto flex flex-col items-center justify-center gap-6 px-4 py-8 text-center sm:px-8 sm:py-12"
			>
				<!-- Translation Prompt -->
				<p class="max-w-xl text-lg font-semibold text-primary sm:text-2xl">
					{currentWord.romaji}
				</p>

				<!-- Hero Kanji with Furigana Ruby -->
				<h2
					class="text-4xl leading-tight font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl"
					lang="ja"
				>
					{#each currentWord.furigana as part, index (index)}
						{#if part.reading}
							<ruby class="px-0.5">
								{part.text}
								<rp>(</rp>
								<rt
									class="mb-1.5 text-sm font-medium tracking-widest text-muted-foreground sm:text-base"
								>
									{part.reading}
								</rt>
								<rp>)</rp>
							</ruby>
						{:else}
							{part.text}
						{/if}
					{/each}
				</h2>

				<!-- Romaji Readings -->
				<p class="text-xs tracking-wider text-muted-foreground uppercase sm:text-sm">
					{currentWord.translation}
				</p>

				<!-- Contextual Example Sentence Card -->
				{#if currentWord.example.japanese || currentWord.example.indonesian}
					<div
						class="w-full max-w-xl rounded-2xl border border-border/80 bg-muted/50 p-4 text-center sm:p-5"
					>
						{#if currentWord.example.japanese}
							<p class="text-base leading-relaxed font-medium sm:text-lg" lang="ja">
								{currentWord.example.japanese}
							</p>
						{/if}
						{#if currentWord.example.indonesian}
							<p class="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
								{currentWord.example.indonesian}
							</p>
						{/if}
					</div>
				{/if}

				<!-- Listen Again Single Word Replay Button (Mirrors LISTEN AGAIN in Reference UI) -->
				<Button
					variant="ghost"
					size="sm"
					class="h-8 gap-2 font-bold tracking-wider text-primary uppercase"
					disabled={!canPlay(currentWord)}
					onclick={replayCurrentWord}
					aria-label={`Dengarkan ulang pelafalan ${currentWord.romaji}`}
				>
					<Volume2Icon data-icon="inline-start" class="size-4" aria-hidden="true" />
					Dengarkan Ulang
				</Button>

				<!-- Navigation & Transport Controls -->
				<div
					class="flex items-center justify-center gap-3 pt-2 sm:gap-5"
					role="group"
					aria-label="Kontrol pemutaran kosakata"
				>
					<Button
						variant="outline"
						size="icon"
						disabled={currentIndex <= 0}
						onclick={goPrevious}
						aria-label="Kosakata sebelumnya"
					>
						<SkipBackIcon />
					</Button>

					<Button
						size="icon-lg"
						class="size-14 rounded-full sm:size-16"
						aria-pressed={isPlaying}
						onclick={togglePlayPause}
						aria-label={isPlaying ? 'Jeda pemutaran' : 'Putar semua kosakata'}
					>
						{#if isPlaying}
							<PauseIcon class="size-6 fill-current" aria-hidden="true" />
						{:else}
							<PlayIcon class="size-6 fill-current" aria-hidden="true" />
						{/if}
					</Button>

					<Button
						variant="outline"
						size="icon"
						disabled={currentIndex >= items.length - 1}
						onclick={goNext}
						aria-label="Kosakata berikutnya"
					>
						<SkipForwardIcon />
					</Button>
				</div>

				{#if speechMessage}
					<p
						class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
						role="status"
					>
						{speechMessage}
					</p>
				{/if}
			</Card.Content>

			<!-- Bottom Progress Footer with Counter (Reference UI Bottom Red Progress Line) -->
			<Card.Footer class="flex-col gap-2 pt-2 pb-6 sm:pb-8">
				<div
					class="flex w-full items-center justify-between text-xs font-semibold text-muted-foreground sm:text-sm"
				>
					<span>
						{isPlaying ? 'Memutar otomatis…' : 'Dijeda (Gunakan panah kiri/kanan untuk navigasi)'}
					</span>
					<span class="tabular-nums">
						{paddedCurrent} / {paddedTotal}
					</span>
				</div>
				<Progress
					value={currentIndex + 1}
					max={items.length}
					class="h-1.5 w-full bg-muted"
					aria-label="Progres kosakata"
				/>
			</Card.Footer>
		</Card.Root>
	{/if}
</div>
