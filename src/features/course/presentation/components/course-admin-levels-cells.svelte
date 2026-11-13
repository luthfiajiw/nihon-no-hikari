<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { MoreVertical, Pencil, Trash2 } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { CourseAdminLevel } from '$features/course/domain/entities/course-admin.entity';

	type Props =
		| { cell: 'actions-header' }
		| {
				cell: 'code' | 'name' | 'description' | 'price' | 'points' | 'order';
				row: CourseAdminLevel;
		  }
		| {
				cell: 'actions';
				row: CourseAdminLevel;
				onDelete: (level: CourseAdminLevel) => void;
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
	<div class="flex items-center justify-end">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props: triggerProps })}
					<Button
						variant="outline"
						size="icon-sm"
						aria-label={`Aksi level ${props.row.code}`}
						{...triggerProps}
					>
						<MoreVertical />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-40">
				<DropdownMenu.Group>
					<DropdownMenu.Item
						aria-label={`Edit ${props.row.code}`}
						onclick={() => goto(resolve('/(protected)/admin/levels/[id]', { id: props.row.id }))}
					>
						<Pencil />
						Edit
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item
						variant="destructive"
						aria-label={`Hapus level ${props.row.code}`}
						onclick={() => props.onDelete(props.row)}
					>
						<Trash2 />
						Hapus
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
{/if}
