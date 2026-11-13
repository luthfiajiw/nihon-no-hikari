<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { BookOpen, EyeOff, MoreVertical, Pencil, Trash2 } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { KotobaAdminTopic } from '$features/kotoba/presentation/models/kotoba-admin.model';

	type Props =
		| { cell: 'actions-header' }
		| { cell: 'title' | 'level' | 'vocab' | 'order' | 'status'; row: KotobaAdminTopic }
		| { cell: 'actions'; row: KotobaAdminTopic; onDelete: (topic: KotobaAdminTopic) => void };

	let props: Props = $props();
</script>

{#if props.cell === 'actions-header'}
	<div class="text-right">Aksi</div>
{:else if props.cell === 'title'}
	<div class="max-w-xs min-w-0 space-y-1 sm:max-w-md">
		<button
			type="button"
			class="block w-full truncate text-left font-semibold text-foreground transition-colors hover:text-primary"
			onclick={() => goto(resolve('/(protected)/admin/kotoba/[id]', { id: props.row.id }))}
		>
			{props.row.title}
		</button>
		{#if props.row.description}
			<p class="line-clamp-2 text-xs text-muted-foreground">{props.row.description}</p>
		{/if}
	</div>
{:else if props.cell === 'level'}
	<div class="flex flex-wrap items-center gap-1.5">
		<Badge>{props.row.level}</Badge>
		<Badge variant="secondary">{props.row.category}</Badge>
	</div>
{:else if props.cell === 'vocab'}
	<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
		<BookOpen class="size-3.5" />
		<span>{props.row.vocabularyCount ?? props.row.vocabulary.length} kosakata</span>
	</div>
{:else if props.cell === 'order'}
	<span class="text-xs text-muted-foreground">Urutan {props.row.order}</span>
{:else if props.cell === 'status'}
	<div class="flex flex-wrap items-center gap-1.5">
		<Badge
			variant="outline"
			class={props.row.active
				? 'border-emerald-300 text-emerald-700 dark:text-emerald-300'
				: 'text-muted-foreground'}
		>
			{props.row.active ? 'Aktif' : 'Nonaktif'}
		</Badge>
		{#if !props.row.visible}
			<span class="flex items-center gap-1 text-xs text-muted-foreground">
				<EyeOff class="size-3" /> Disembunyikan
			</span>
		{/if}
	</div>
{:else if props.cell === 'actions'}
	<div class="flex items-center justify-end">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props: triggerProps })}
					<Button
						variant="outline"
						size="icon-sm"
						aria-label={`Aksi topik ${props.row.title}`}
						{...triggerProps}
					>
						<MoreVertical />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-40">
				<DropdownMenu.Group>
					<DropdownMenu.Item
						aria-label={`Edit topik ${props.row.title}`}
						onclick={() => goto(resolve('/(protected)/admin/kotoba/[id]', { id: props.row.id }))}
					>
						<Pencil />
						Edit
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item
						variant="destructive"
						aria-label={`Hapus topik ${props.row.title}`}
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
