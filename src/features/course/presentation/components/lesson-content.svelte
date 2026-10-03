<script lang="ts">
	import * as ScrollArea from '$lib/components/ui/scroll-area';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils.js';
	import DOMPurify from 'isomorphic-dompurify';
	import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-svelte';

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
</script>

<div class="h-full min-w-0 flex-1 overflow-hidden">
	<ScrollArea.Root class="h-full" orientation="vertical">
		<article class="mx-auto max-w-5xl px-6 pt-6 pb-16">
			<h1 class="mb-7 text-2xl leading-tight font-extrabold tracking-tight text-foreground">
				{title}
			</h1>

			<div class="space-y-4 text-sm leading-relaxed text-foreground sm:text-base">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html sanitizedContent}

				{#if parsedContent.tips}
					<blockquote
						class="my-6 rounded-r-lg border-l-4 border-rose-300 bg-rose-50/80 px-3 py-4 text-sm dark:bg-rose-950/30"
					>
						<p class="m-0 text-slate-700 dark:text-slate-300">
							💡 <strong class="font-semibold">Tips:</strong>
							{parsedContent.tips}
						</p>
					</blockquote>
				{/if}

				{#if previousLessonTitle || nextLessonTitle}
					<div
						class={cn('flex items-center gap-4 pt-4', {
							'justify-between': Boolean(previousLessonTitle && nextLessonTitle),
							'justify-end': Boolean(
								(previousLessonTitle && !nextLessonTitle) || (!previousLessonTitle && nextLessonTitle)
							)
						})}
					>
						{#if previousLessonTitle}
							<Button variant="outline" type="button" onclick={onPreviousLesson}>
								<ArrowLeftIcon class="size-4 mr-2" /> {previousLessonTitle}
							</Button>
						{/if}

						{#if nextLessonTitle}
							<Button
								variant="outline"
								type="button"
								disabled={isNextLessonLoading}
								onclick={onNextLesson}
							>
								{nextLessonTitle} <ArrowRightIcon class="size-4 ml-2" />
							</Button>
						{/if}
					</div>
				{/if}
			</div>
		</article>
	</ScrollArea.Root>
</div>
