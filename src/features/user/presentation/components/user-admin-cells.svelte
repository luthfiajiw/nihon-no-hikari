<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import type { UserAdminRecord } from '$features/user/domain/entities/user-admin.entity';

	type Props =
		| { cell: 'name' | 'email' | 'role'; row: UserAdminRecord }
		| { cell: 'actions'; row: UserAdminRecord; currentUserId?: string };

	let props: Props = $props();
</script>

{#if props.cell === 'name'}
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
	{#if props.row.id === props.currentUserId}
		<span class="text-xs font-medium text-muted-foreground">Akun Anda</span>
	{:else}
		<form method="POST" action="?/changeRole" class="flex items-center gap-2">
			<Input type="hidden" name="userId" value={props.row.id} />
			<Input type="hidden" name="role" value={props.row.role === 'Admin' ? 'User' : 'Admin'} />
			<Button type="submit" variant="outline" size="sm">
				{props.row.role === 'Admin' ? 'Jadikan User' : 'Jadikan Admin'}
			</Button>
		</form>
	{/if}
{/if}
