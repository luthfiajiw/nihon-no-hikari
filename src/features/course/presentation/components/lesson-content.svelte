<script lang="ts">
	import * as ScrollArea from "$lib/components/ui/scroll-area";
	import DOMPurify from "isomorphic-dompurify";

	interface Props {
		title?: string;
		content?: string;
	}

	let {
		title = "Pengenalan Huruf Hiragana",
		content = ""
	}: Props = $props();

	let sanitizedContent = $derived(content ? DOMPurify.sanitize(content) : "");
</script>

<div class="flex-1 min-w-0 h-full overflow-hidden">
	<ScrollArea.Root class="h-full" orientation="vertical">
		<article class="max-w-3xl mx-auto px-6 py-10 pb-16">
			<h1 class="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight mb-7">{title}</h1>

			<div class="text-sm sm:text-base leading-relaxed text-foreground space-y-4">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html sanitizedContent}
			</div>
		</article>
	</ScrollArea.Root>
</div>
