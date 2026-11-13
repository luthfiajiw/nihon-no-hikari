<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Pencil } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import type { CourseAdminLevel } from '$features/course/domain/entities/course-admin.entity';

	type Props =
		| { cell: 'actions-header' }
		| {
				cell: 'code' | 'name' | 'description' | 'price' | 'points' | 'order' | 'actions';
				row: CourseAdminLevel;
		  };

	let props: Props = $props();

	function formatRupiah(value: number): string {
		if (value === 0) return 'Gratis';
		return 'Rp ' + new Intl.NumberFormat('id-ID').format(value);
	}
</script>

{#if props.cell === 'actions-header'}
	<div class="text-right">Aksi</div>
{:else if props.cell === 'code'}
	<span
		class="inline-flex items-center justify-center rounded-lg bg-surface-container-highest px-2.5 py-1 text-xs font-bold text-on-surface"
	>
		{props.row.code}
	</span>
{:else if props.cell === 'name'}
	<span class="font-medium text-foreground">{props.row.name}</span>
{:else if props.cell === 'description'}
	<span class="block max-w-xs truncate text-muted-foreground">
		{props.row.description || '-'}
	</span>
{:else if props.cell === 'price'}
	<span class="font-semibold text-foreground">
		{formatRupiah(props.row.price)}
	</span>
{:else if props.cell === 'points'}
	<span class="text-muted-foreground">
		{props.row.points?.length ?? 0} poin
	</span>
{:else if props.cell === 'order'}
	<span class="text-muted-foreground">
		{props.row.order_index}
	</span>
{:else if props.cell === 'actions'}
	<div class="flex justify-end">
		<Button
			variant="outline"
			size="sm"
			class="gap-1.5"
			aria-label={`Edit ${props.row.code}`}
			onclick={() => goto(resolve('/(protected)/admin/levels/[id]', { id: props.row.id }))}
		>
			<Pencil class="size-3.5" /> Edit
		</Button>
	</div>
{/if}
