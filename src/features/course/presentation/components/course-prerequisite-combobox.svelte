<script lang="ts">
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';

	let {
		id,
		label,
		options,
		value = '',
		onValueChange
	}: {
		id: string;
		label: string;
		options: { id: string; label: string }[];
		value: string;
		onValueChange: (value: string) => void;
	} = $props();
	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	const selectedLabel = $derived(options.find((option) => option.id === value)?.label ?? value);
	async function select(next: string) {
		onValueChange(next);
		open = false;
		await tick();
		triggerRef?.focus();
	}
</script>

<div class="min-w-0 space-y-2">
	<label for={id} class="block text-sm font-medium">{label}</label>
	<Popover.Root bind:open>
		<Popover.Trigger {id}>
			{#snippet child({ props })}
				<Button
					{...props}
					bind:ref={triggerRef}
					variant="outline"
					role="combobox"
					aria-expanded={open}
					aria-describedby={`${id}-description`}
					class="h-auto min-h-10 w-full justify-between gap-2 px-3 py-2 font-normal"
				>
					<span class="truncate">{selectedLabel || 'Tanpa prasyarat'}</span>
					<ChevronsUpDown class="size-4 opacity-50" />
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content align="start" class="w-[var(--bits-popover-anchor-width)] p-0">
			<Command.Root>
				<Command.Input placeholder="Cari prasyarat..." aria-label={`Cari ${label.toLowerCase()}`} />
				<Command.List>
					<Command.Empty>Prasyarat tidak ditemukan.</Command.Empty>
					<Command.Group>
						<Command.Item
							value="no-prerequisite"
							keywords={['Tanpa prasyarat']}
							onSelect={() => select('')}
						>
							<Check class={cn('size-4 shrink-0', value !== '' && 'opacity-0')} />
							Tanpa prasyarat
						</Command.Item>
						{#each options as option (option.id)}
							<Command.Item
								value={option.id}
								keywords={[option.label]}
								data-checked={value === option.id}
								onSelect={() => select(option.id)}
							>
								<Check class={cn('size-4 shrink-0', value !== option.id && 'opacity-0')} />
								<span class="min-w-0 whitespace-normal">{option.label}</span>
								<span class="sr-only">{value === option.id ? 'Dipilih' : 'Belum dipilih'}</span>
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
	<p id={`${id}-description`} class="text-sm text-taupe-500">
		Prasyarat yang dipilih harus diselesaikan sebelum materi ini dibuka. Pilih “Tanpa prasyarat”
		jika tidak diperlukan.
	</p>
</div>
