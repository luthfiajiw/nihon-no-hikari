<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { cn } from '$lib/utils';

	let {
		value = $bindable(''),
		options,
		id,
		'aria-label': ariaLabel,
		class: className,
		placeholder = 'Pilih opsi'
	}: {
		value?: string;
		options: { value: string; label: string }[];
		id?: string;
		'aria-label'?: string;
		class?: string;
		placeholder?: string;
	} = $props();
</script>

<Select.Root type="single" bind:value items={options} allowDeselect={false}>
	<Select.Trigger {id} aria-label={ariaLabel} class={cn('w-full min-w-0 bg-background', className)}>
		<Select.Value {placeholder} />
	</Select.Trigger>
	<Select.Content>
		{#each options as option (option.value)}
			<Select.Item value={option.value} label={option.label} />
		{/each}
	</Select.Content>
</Select.Root>
