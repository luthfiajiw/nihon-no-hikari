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
		<article class="max-w-4xl mx-auto px-6 pt-6 pb-16">
			<h1 class="text-2xl font-extrabold text-foreground tracking-tight leading-tight mb-7">{title}</h1>

			<div class="text-sm sm:text-base leading-relaxed text-foreground space-y-4">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html sanitizedContent}
			</div>
		</article>
	</ScrollArea.Root>
</div>
