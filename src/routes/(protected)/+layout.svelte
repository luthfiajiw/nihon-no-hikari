<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { navigating } from '$app/state';
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import { Button } from "$lib/components/ui/button";
	import { BellIcon, ChevronDownIcon, LoaderCircle } from "lucide-svelte";
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	let isSigningOut = $state(false);
	let signOutError = $state(false);

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

			await goto(resolve('/signin'), { invalidateAll: true });
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
      class="flex h-16 shrink-0 items-center border-b justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
    >
      <div class="flex items-center gap-2 px-4">
        <Sidebar.Trigger />
        <p class="pl-1 text-base">Ganbare, {data.user.display_name.split(' ')[0]}!</p>
      </div>

			<div class="flex items-center gap-2 pr-6">
				<Button variant="outline" size="icon" class="rounded-full border-none">
					<BellIcon />
				</Button>
				<Separator orientation="vertical" class="mr-1.5 data-[orientation=vertical]:h-5"/>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({props})}
							<div class="flex items-center cursor-pointer" {...props}>
								<Avatar.Root>
									<Avatar.Image src={data.user.avatar_url ?? 'https://github.com/shadcn.png'} alt="@shadcn" />
									<Avatar.Fallback>CN</Avatar.Fallback>
								</Avatar.Root>

								<div class="flex flex-col items-start pl-3 pr-4">
									<p class="font-medium text-sm">{data.user.display_name}</p>
									<p class="text-xs text-muted-foreground">Level Pemula</p>
								</div>

								<ChevronDownIcon class="size-4"/>
							</div>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-48" align="end" sideOffset={16}>
						<DropdownMenu.Group>
							<DropdownMenu.Item>
								Profile
							</DropdownMenu.Item>
							<DropdownMenu.Item>
								Subscription
							</DropdownMenu.Item>
						</DropdownMenu.Group>
						<DropdownMenu.Separator />
						<DropdownMenu.Item variant="destructive" disabled={isSigningOut} onclick={handleSignOut}>
							{#if isSigningOut}
								<LoaderCircle class="animate-spin" />
							{/if}
							{signOutError ? 'Gagal keluar. Coba lagi.' : 'Keluar'}
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
    </header>
    <section class="h-[calc(100svh-4rem)] group-has-data-[collapsible=icon]/sidebar-wrapper:h-[calc(100svh-3rem)] flex-1 min-h-0 overflow-y-auto bg-neutral-100">
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
