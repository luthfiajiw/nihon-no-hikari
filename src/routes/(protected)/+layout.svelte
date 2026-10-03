<script lang="ts">
	import { resolve } from '$app/paths';
	import { navigating } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import { Button } from '$lib/components/ui/button';
	import { BellIcon, ChevronDownIcon, LoaderCircle } from 'lucide-svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	let isSigningOut = $state(false);
	let signOutError = $state(false);
	const displayName = $derived(data.user?.display_name ?? 'Pengguna');
	const firstName = $derived(displayName.trim().split(/\s+/)[0] || 'Pengguna');

	async function handleSignOut() {
		if (isSigningOut) return;

		isSigningOut = true;
		signOutError = false;

		try {
			const response = await fetch('/api/auth/signout', { method: 'POST' });

			if (!response.ok) {
				signOutError = true;
				return;
			}

			// The auth cookie has already been removed by the response. A client-side
			// navigation can re-run the still-mounted protected layout without a user
			// before it is destroyed. Replace the document so the signed-out state only
			// ever renders the public route.
			window.location.replace(resolve('/signin'));
		} catch {
			signOutError = true;
		} finally {
			isSigningOut = false;
		}
	}
</script>

<Sidebar.Provider>
	{#if navigating.to}
		<div
			class="absolute inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-sky-100"
			role="progressbar"
			aria-label="Memuat halaman"
		>
			<div class="route-progress-indicator h-full bg-sky-500"></div>
		</div>
	{/if}
	<AppSidebar />
	<Sidebar.Inset class="relative h-svh overflow-hidden">
		<header
			class="flex h-16 shrink-0 items-center justify-between gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
		>
			<div class="flex items-center gap-2 px-4">
				<Sidebar.Trigger />
				<p class="pl-1 text-base">Ganbare, {firstName}!</p>
			</div>

			<div class="flex items-center gap-2 pr-6">
				<Button variant="outline" size="icon" class="rounded-full border-none">
					<BellIcon />
				</Button>
				<Separator orientation="vertical" class="mr-1.5 data-[orientation=vertical]:h-5" />
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<div class="flex cursor-pointer items-center" {...props}>
								<Avatar.Root>
									<Avatar.Image
										src={data.user?.avatar_url ?? 'https://github.com/shadcn.png'}
										alt={displayName}
									/>
									<Avatar.Fallback>CN</Avatar.Fallback>
								</Avatar.Root>

								<div class="flex flex-col items-start pr-4 pl-3">
									<p class="text-sm font-medium">{displayName}</p>
									<p class="text-xs text-muted-foreground">Level Pemula</p>
								</div>

								<ChevronDownIcon class="size-4" />
							</div>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-48" align="end" sideOffset={16}>
						<DropdownMenu.Group>
							<DropdownMenu.Item>Profile</DropdownMenu.Item>
							<DropdownMenu.Item>Subscription</DropdownMenu.Item>
						</DropdownMenu.Group>
						<DropdownMenu.Separator />
						<DropdownMenu.Item
							variant="destructive"
							disabled={isSigningOut}
							onclick={handleSignOut}
						>
							{#if isSigningOut}
								<LoaderCircle class="animate-spin" />
							{/if}
							{signOutError ? 'Gagal keluar. Coba lagi.' : 'Keluar'}
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</header>
		<section
			class="h-[calc(100svh-4rem)] min-h-0 flex-1 overflow-y-auto bg-neutral-100 group-has-data-[collapsible=icon]/sidebar-wrapper:h-[calc(100svh-3rem)]"
		>
			{@render children?.()}
		</section>
	</Sidebar.Inset>
</Sidebar.Provider>

<style>
	.route-progress-indicator {
		width: 45%;
		animation: route-progress 1s ease-in-out infinite;
	}

	@keyframes route-progress {
		from {
			transform: translateX(-100%);
		}

		to {
			transform: translateX(325%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.route-progress-indicator {
			width: 100%;
			animation: none;
		}
	}
</style>
