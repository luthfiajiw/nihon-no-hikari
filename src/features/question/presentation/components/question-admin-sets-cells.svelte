<script lang="ts">
	import type { Pathname } from '$app/types';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { MoreVertical, Pencil } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { QuestionAdminRecord } from '$features/question/domain/entities/question-admin.entity';

	type Props =
		| { cell: 'actions-header' }
		| { cell: 'title' | 'skill' | 'version' | 'actions'; row: QuestionAdminRecord };

	let props: Props = $props();
</script>

{#if props.cell === 'actions-header'}
	<div class="text-right">Aksi</div>
{:else if props.cell === 'title'}
	<button
		type="button"
		class="group flex w-full items-center gap-3 text-left transition-colors"
		onclick={() => goto(resolve(`/admin/content/question_set/${props.row.id}` as Pathname))}
	>
		<div class="min-w-0 flex-1">
			<span class="block truncate text-sm font-semibold text-foreground group-hover:text-primary">
				{props.row.title}
			</span>
			<span class="block text-xs text-muted-foreground">
				{props.row.kind === 'final_exam' ? 'Ujian module' : 'Latihan lesson'}
			</span>
		</div>
	</button>
{:else if props.cell === 'skill'}
	<span class="text-sm font-medium text-muted-foreground capitalize">
		{props.row.skill === 'writing'
			? 'Writing'
			: props.row.skill === 'reading'
				? 'Reading'
				: 'Gabungan'}
	</span>
{:else if props.cell === 'version'}
	<span class="text-xs text-muted-foreground">
		v{props.row.version ?? 1}
	</span>
{:else if props.cell === 'actions'}
	<div class="flex items-center justify-end">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props: triggerProps })}
					<Button
						variant="outline"
						size="icon-sm"
						aria-label={`Aksi question set ${props.row.title}`}
						{...triggerProps}
					>
						<MoreVertical />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-40">
				<DropdownMenu.Group>
					<DropdownMenu.Item
						aria-label={`Edit question set ${props.row.title}`}
						onclick={() => goto(resolve(`/admin/content/question_set/${props.row.id}` as Pathname))}
					>
						<Pencil />
						Edit
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
{/if}
