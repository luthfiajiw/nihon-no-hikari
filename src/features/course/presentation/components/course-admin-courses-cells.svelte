<script lang="ts">
	import type { Pathname } from '$app/types';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { FileText, Layers, MoreVertical, Pencil, Trash2 } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { CourseAdminRecord } from '$features/course/domain/entities/course-admin.entity';

	type Props =
		| { cell: 'actions-header' }
		| {
				cell: 'title' | 'level' | 'counts' | 'order';
				row: CourseAdminRecord;
		  }
		| {
				cell: 'actions';
				row: CourseAdminRecord;
				onDelete: (course: CourseAdminRecord) => void;
		  };

	let props: Props = $props();
</script>

{#if props.cell === 'actions-header'}
	<div class="text-right">Aksi</div>
{:else if props.cell === 'title'}
	<div class="flex max-w-xs min-w-0 items-center gap-3 sm:max-w-md">
		<div class="min-w-0 flex-1 space-y-0.5">
			<button
				type="button"
				class="block w-full truncate text-left font-semibold text-foreground transition-colors hover:text-primary"
				onclick={() => goto(resolve(`/admin/courses/${props.row.id}` as Pathname))}
			>
				{props.row.title}
			</button>
			<p class="line-clamp-1 text-xs text-muted-foreground">
				{props.row.description || 'Susun module dan lesson untuk kursus ini.'}
			</p>
		</div>
	</div>
{:else if props.cell === 'level'}
	{#if props.row.level_code}
		<Badge variant="secondary">{props.row.level_code}</Badge>
	{:else}
		<span class="text-xs text-muted-foreground">-</span>
	{/if}
{:else if props.cell === 'counts'}
	<div class="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
		<span class="flex items-center gap-1">
			<Layers class="size-3.5" />
			{props.row.module_count ?? 0} module
		</span>
		<span class="flex items-center gap-1">
			<FileText class="size-3.5" />
			{props.row.lesson_count ?? 0} lesson
		</span>
	</div>
{:else if props.cell === 'order'}
	<span class="text-xs text-muted-foreground">Urutan {props.row.order_index ?? 0}</span>
{:else if props.cell === 'actions'}
	<div class="flex items-center justify-end">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props: triggerProps })}
					<Button
						variant="outline"
						size="icon-sm"
						aria-label={`Aksi kursus ${props.row.title}`}
						{...triggerProps}
					>
						<MoreVertical />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-44">
				<DropdownMenu.Group>
					<DropdownMenu.Item
						aria-label={`Lihat materi ${props.row.title}`}
						onclick={() => goto(resolve(`/admin/courses/${props.row.id}` as Pathname))}
					>
						<Layers />
						Lihat Materi
					</DropdownMenu.Item>
					<DropdownMenu.Item
						aria-label={`Edit kursus ${props.row.title}`}
						onclick={() => goto(resolve(`/admin/content/course/${props.row.id}` as Pathname))}
					>
						<Pencil />
						Edit
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item
						variant="destructive"
						aria-label={`Hapus kursus ${props.row.title}`}
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
