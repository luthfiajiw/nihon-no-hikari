<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { MoreVertical, Pencil } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { QuestionKanaTemplateMetadata } from '$features/question/domain/entities/question-kana-template.entity';

	type Props =
		| { cell: 'actions-header' }
		| { cell: 'character' | 'script' | 'actions'; row: QuestionKanaTemplateMetadata };

	let props: Props = $props();
</script>

{#if props.cell === 'actions-header'}
	<div class="text-right">Aksi</div>
{:else if props.cell === 'character'}
	<span class="text-3xl font-medium">{props.row.character}</span>
{:else if props.cell === 'script'}
	<span class="capitalize">{props.row.script}</span>
{:else if props.cell === 'actions'}
	<div class="flex items-center justify-end">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props: triggerProps })}
					<Button
						variant="outline"
						size="icon-sm"
						aria-label={`Aksi template ${props.row.character} ${props.row.source_version}`}
						{...triggerProps}
					>
						<MoreVertical />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-40">
				<DropdownMenu.Group>
					<DropdownMenu.Item
						aria-label={`Edit template ${props.row.character} ${props.row.source_version}`}
						onclick={() =>
							goto(resolve('/(protected)/admin/kana-templates/[id]', { id: props.row.id }))}
					>
						<Pencil />
						Edit
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
{/if}
