<script lang="ts">
	import { ImageIcon } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import type { KotobaMedia } from '../models/admin-kotoba.model';
	let {
		media,
		alt = '',
		class: className
	}: {
		media: KotobaMedia | null;
		alt?: string;
		class?: string;
	} = $props();
	let fileURL = $state('');
	$effect(() => {
		const file = media?.file;
		if (!file) {
			fileURL = '';
			return;
		}
		const url = URL.createObjectURL(file);
		fileURL = url;
		return () => URL.revokeObjectURL(url);
	});
	const src = $derived(media?.file ? fileURL : media?.url);
</script>

<div class={cn('overflow-hidden rounded-xl bg-muted', className)}>
	{#if src}
		<img {src} {alt} class="h-full w-full object-cover" />
	{:else}
		<div
			class="flex h-full min-h-24 items-center justify-center text-muted-foreground"
			aria-label="Belum ada cover"
		>
			<ImageIcon class="size-8 opacity-50" aria-hidden="true" />
		</div>
	{/if}
</div>
