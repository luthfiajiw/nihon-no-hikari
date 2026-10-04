<script lang="ts">
	import { env } from '$env/dynamic/public';
	import * as ScrollArea from '$lib/components/ui/scroll-area';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils.js';
	import DOMPurify from 'isomorphic-dompurify';
	import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-svelte';
	import { onDestroy } from 'svelte';
	import { resolveLessonAudioUrl } from '../utils/lesson-audio';

	interface Props {
		title?: string;
		content?: string;
		previousLessonTitle?: string;
		nextLessonTitle?: string;
		onPreviousLesson?: () => void;
		onNextLesson?: () => void;
		isNextLessonLoading?: boolean;
	}

	interface LessonContentData {
		content: string;
		tips: string;
	}

	let {
		title = 'Pengenalan Huruf Hiragana',
		content = '',
		previousLessonTitle,
		nextLessonTitle,
		onPreviousLesson,
		onNextLesson,
		isNextLessonLoading = false
	}: Props = $props();

	function parseContent(value: string): LessonContentData {
		try {
			const parsed: unknown = JSON.parse(value);

			if (typeof parsed === 'object' && parsed !== null) {
				const data = parsed as Record<string, unknown>;

				return {
					content: typeof data.content === 'string' ? data.content : '',
					tips: typeof data.tips === 'string' ? data.tips : ''
				};
			}
		} catch {
			// Konten lama dapat berupa HTML atau teks biasa, bukan JSON.
		}

		return { content: value, tips: '' };
	}

	let parsedContent = $derived(parseContent(content));
	let sanitizedContent = $derived(DOMPurify.sanitize(parsedContent.content));
	let activeAudio: HTMLAudioElement | null = null;
	let activeAudioButton: HTMLButtonElement | null = null;
	let renderedContent = '';

	function resetActiveAudio(expectedAudio?: HTMLAudioElement): void {
		if (expectedAudio && activeAudio !== expectedAudio) return;

		if (activeAudio) {
			activeAudio.pause();
			activeAudio.currentTime = 0;
		}

		activeAudioButton?.classList.remove('is-playing');
		activeAudioButton?.setAttribute('aria-pressed', 'false');
		activeAudio = null;
		activeAudioButton = null;
	}

	async function handleContentClick(event: MouseEvent): Promise<void> {
		const target = event.target;
		if (!(target instanceof Element)) return;

		const button = target.closest<HTMLButtonElement>('button[data-play-audio]');
		if (!button) return;

		const audioContainer = button.closest<HTMLElement>('[data-audio]');
		const audioValue = audioContainer?.dataset.audio;
		if (!audioValue) return;

		if (activeAudio && activeAudioButton === button && !activeAudio.paused) {
			resetActiveAudio();
			return;
		}

		const audioUrl = resolveLessonAudioUrl(audioValue, env.PUBLIC_LESSON_AUDIO_BASE_URL ?? '');
		if (!audioUrl) {
			console.error(
				'PUBLIC_LESSON_AUDIO_BASE_URL belum dikonfigurasi atau data-audio tidak valid.'
			);
			return;
		}

		resetActiveAudio();

		const audio = new Audio(audioUrl);
		activeAudio = audio;
		activeAudioButton = button;
		button.classList.add('is-playing');
		button.setAttribute('aria-pressed', 'true');

		audio.addEventListener('ended', () => resetActiveAudio(audio), { once: true });
		audio.addEventListener('error', () => resetActiveAudio(audio), { once: true });

		try {
			await audio.play();
		} catch (error) {
			resetActiveAudio(audio);
			console.error('Audio lesson gagal diputar.', error);
		}
	}

	function lessonAudio(node: HTMLElement): { destroy: () => void } {
		node.addEventListener('click', handleContentClick);

		return {
			destroy: () => node.removeEventListener('click', handleContentClick)
		};
	}

	$effect(() => {
		// Hentikan audio lama saat pengguna berpindah ke lesson lain.
		if (renderedContent === sanitizedContent) return;
		renderedContent = sanitizedContent;
		resetActiveAudio();
	});

	onDestroy(resetActiveAudio);
</script>

<div class="h-full min-w-0 flex-1 overflow-hidden">
	<ScrollArea.Root class="h-full" orientation="vertical">
		<article class="mx-auto max-w-5xl px-6 pt-6 pb-16">
			<h1 class="mb-7 text-2xl leading-tight font-extrabold tracking-tight text-foreground">
				{title}
			</h1>

			<div class="space-y-4 text-sm leading-relaxed text-foreground sm:text-base" use:lessonAudio>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html sanitizedContent}

				{#if parsedContent.tips}
					<blockquote
						class="my-6 rounded-2xl border border-amber-300 bg-amber-50/80 px-5 py-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200"
					>
						<p class="m-0 flex items-start gap-2">
							<span aria-hidden="true" class="shrink-0">💡</span>
							<span>
								<strong class="font-bold">Tips:</strong>
								{parsedContent.tips}
							</span>
						</p>
					</blockquote>
				{/if}

				{#if previousLessonTitle || nextLessonTitle}
					<div
						class={cn('flex items-center gap-4 pt-4', {
							'justify-between': Boolean(previousLessonTitle && nextLessonTitle),
							'justify-end': Boolean(
								(previousLessonTitle && !nextLessonTitle) ||
								(!previousLessonTitle && nextLessonTitle)
							)
						})}
					>
						{#if previousLessonTitle}
							<Button variant="outline" type="button" onclick={onPreviousLesson}>
								<ArrowLeftIcon class="mr-2 size-4" />
								{previousLessonTitle}
							</Button>
						{/if}

						{#if nextLessonTitle}
							<Button
								variant="outline"
								type="button"
								disabled={isNextLessonLoading}
								onclick={onNextLesson}
							>
								{nextLessonTitle}
								<ArrowRightIcon class="ml-2 size-4" />
							</Button>
						{/if}
					</div>
				{/if}
			</div>
		</article>
	</ScrollArea.Root>
</div>
