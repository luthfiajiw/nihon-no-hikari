<script lang="ts">
	import { getLessonSpeechToken } from '../../data/sources/lesson-speech.source';
	import { AzureLessonSpeech } from '$lib/lesson-speech/azure';
	import { createLessonReader } from '$lib/lesson-speech/reader';
	import '$lib/lesson-speech/reader.css';

	let { lessonId, content }: { lessonId: string; content: string } = $props();
	let root: HTMLDivElement;
	let overlay: HTMLDivElement;
	let error = $state('');
	let reader: ReturnType<typeof createLessonReader> | undefined;

	$effect(() => {
		const id = lessonId;
		// Rebuild text-node mappings after Svelte replaces the HTML, even for the same lesson.
		void content;
		error = '';
		if (!root || !overlay || !id) return;
		const azure = new AzureLessonSpeech((signal) => getLessonSpeechToken(id, signal));
		const controller = createLessonReader(root, overlay, {
			synthesize: azure.synthesize,
			error: (message) => {
				error = message;
			}
		});
		reader = controller;
		return () => {
			controller.destroy();
			reader = undefined;
		};
	});
</script>

<div class="lesson-reader">
	<div bind:this={root} class="lesson-reader-content">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html content}
	</div>
	<div bind:this={overlay} class="lesson-reader-overlay"></div>
</div>
{#if error}
	<div
		class="mt-3 flex flex-wrap items-center gap-3 text-sm text-red-700 dark:text-red-300"
		role="alert"
	>
		<span>{error}</span>
		<button
			type="button"
			class="rounded-md border border-current px-3 py-1 font-medium"
			onclick={() => reader?.retry()}
		>
			Coba lagi
		</button>
	</div>
{/if}
