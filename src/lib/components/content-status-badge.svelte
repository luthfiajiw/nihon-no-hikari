<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		item,
		class: className
	}: { item: { archived_at?: unknown; is_published?: unknown }; class?: string } = $props();
</script>

<span
	class={cn(
		'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
		item.archived_at
			? 'bg-taupe-100 text-taupe-500'
			: item.is_published
				? 'bg-emerald-50 text-emerald-700'
				: 'bg-amber-50 text-amber-700',
		className
	)}
>
	<span class="size-1.5 rounded-full bg-current"></span>
	{item.archived_at ? 'Arsip' : item.is_published ? 'Terbit' : 'Draft'}
</span>
