<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { User as UserIcon, Shield, LoaderCircle, LogOut } from 'lucide-svelte';

	let isSigningOut = $state(false);

	async function handleSignOut() {
		if (isSigningOut) return;
		isSigningOut = true;
		try {
			const res = await fetch('/api/auth/signout', { method: 'POST' });
			if (res.ok) {
				window.location.replace(resolve('/signin'));
			}
		} catch {
			window.location.replace(resolve('/signin'));
		} finally {
			isSigningOut = false;
		}
	}
</script>

<aside class="col-span-12 flex flex-col lg:col-span-4">
	<Card.Root class="gap-4 p-3">
		<div class="px-3 pt-2 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
			Menu Akun
		</div>
		<Tabs.List class="flex w-full flex-col gap-1.5 bg-transparent p-0">
			<Tabs.Trigger
				value="profile"
				class="group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition hover:bg-muted/80 data-[state=active]:bg-muted data-[state=active]:text-foreground"
			>
				<div class="flex items-center gap-3">
					<span
						class="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground"
					>
						<UserIcon class="size-4" />
					</span>
					<span>Profil Saya</span>
				</div>
				<span
					class="h-4 w-1.5 rounded-full bg-primary opacity-0 transition-opacity group-data-[state=active]:opacity-100"
				></span>
			</Tabs.Trigger>

			<Tabs.Trigger
				value="security"
				class="group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition hover:bg-muted/80 data-[state=active]:bg-muted data-[state=active]:text-foreground"
			>
				<div class="flex items-center gap-3">
					<span
						class="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground"
					>
						<Shield class="size-4" />
					</span>
					<span>Keamanan & Akun</span>
				</div>
				<span
					class="h-4 w-1.5 rounded-full bg-primary opacity-0 transition-opacity group-data-[state=active]:opacity-100"
				></span>
			</Tabs.Trigger>
		</Tabs.List>

		<Separator orientation="horizontal" class="h-px w-full" />

		<!-- Logout Action -->
		<button
			type="button"
			disabled={isSigningOut}
			onclick={handleSignOut}
			class="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
		>
			<span
				class="flex size-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive"
			>
				{#if isSigningOut}
					<LoaderCircle class="size-4 animate-spin" />
				{:else}
					<LogOut class="size-4" />
				{/if}
			</span>
			<span>{isSigningOut ? 'Keluar...' : 'Keluar'}</span>
		</button>
	</Card.Root>
</aside>
