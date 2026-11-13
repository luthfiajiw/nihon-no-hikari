<script lang="ts">
	import { MoreVertical, Shield } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import type { UserAdminRecord } from '$features/user/domain/entities/user-admin.entity';

	type Props =
		| { cell: 'actions-header' }
		| { cell: 'name' | 'email' | 'role'; row: UserAdminRecord }
		| { cell: 'actions'; row: UserAdminRecord; currentUserId?: string };

	let props: Props = $props();
	let formEl: HTMLFormElement | undefined = $state();
</script>

{#if props.cell === 'actions-header'}
	<div class="text-right">Aksi</div>
{:else if props.cell === 'name'}
	<span class="font-medium text-foreground">{props.row.display_name}</span>
{:else if props.cell === 'email'}
	<span class="text-muted-foreground">{props.row.email}</span>
{:else if props.cell === 'role'}
	<span
		class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium {props.row.role ===
		'Admin'
			? 'border border-primary/20 bg-primary/10 text-primary'
			: 'border border-border bg-muted text-muted-foreground'}"
	>
		{props.row.role}
	</span>
{:else if props.cell === 'actions'}
	<div class="flex items-center justify-end">
		{#if props.row.id !== props.currentUserId}
			<form method="POST" action="?/changeRole" bind:this={formEl} class="hidden">
				<Input type="hidden" name="userId" value={props.row.id} />
				<Input type="hidden" name="role" value={props.row.role === 'Admin' ? 'User' : 'Admin'} />
			</form>
		{/if}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props: triggerProps })}
					<Button
						variant="outline"
						size="icon-sm"
						aria-label={`Aksi pengguna ${props.row.display_name}`}
						{...triggerProps}
					>
						<MoreVertical />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-44">
				<DropdownMenu.Group>
					{#if props.row.id === props.currentUserId}
						<DropdownMenu.Item disabled>Akun Anda</DropdownMenu.Item>
					{:else}
						<DropdownMenu.Item onclick={() => formEl?.requestSubmit()}>
							<Shield />
							{props.row.role === 'Admin' ? 'Jadikan User' : 'Jadikan Admin'}
						</DropdownMenu.Item>
					{/if}
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
{/if}
