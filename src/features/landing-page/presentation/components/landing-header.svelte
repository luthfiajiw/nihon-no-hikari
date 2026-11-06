<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import logoFull from '$lib/assets/images/gakkobit-full-logo.png';

	let {
		user,
		displayName,
		avatarUrl,
		activeSection,
		navSections,
		scrollTo
	}: {
		user: any;
		displayName: string;
		avatarUrl: string;
		activeSection: string;
		navSections: { id: string; label: string }[];
		scrollTo: (id: string, e?: MouseEvent) => void;
	} = $props();
</script>

<!-- HEADER NAVIGATION -->
<header class="fixed top-0 right-0 left-0 z-50 border-b border-outline-variant/40 bg-surface/90 shadow-xs backdrop-blur-md">
	<div class="mx-auto flex h-20 max-w-7xl items-center justify-between gap-space-md px-gutter">
		<!-- Logo -->
		<div class="flex items-center">
			<a
				class="group flex items-center gap-space-sm"
				href="#beranda"
				onclick={(e) => scrollTo('beranda', e)}
			>
				<img
					alt="Gakkobit Ganbare Logo"
					class="h-9 w-auto object-contain"
					src={logoFull}
				/>
			</a>
		</div>

		<!-- Center Nav Menu -->
		<nav
			class="mx-auto hidden items-center justify-center gap-1.5 rounded-full border border-outline-variant/20 bg-surface-container/60 p-1.5 xl:flex"
			id="main-nav"
		>
			{#each navSections as item}
				<button
					type="button"
					onclick={(e) => scrollTo(item.id, e)}
					class="rounded-full px-3.5 py-1.5 font-label-lg text-label-lg transition-all duration-200 {activeSection === item.id
						? 'bg-primary-fixed font-bold text-primary-container shadow-xs'
						: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}"
				>
					{item.label}
				</button>
			{/each}
		</nav>

		<!-- Right Auth Action Area -->
		<div class="flex items-center gap-space-sm sm:gap-space-md">
			{#if user}
				<div class="flex items-center gap-3">
					<a
						class="landing-btn-primary inline-flex items-center justify-center rounded-full bg-primary-container px-space-lg py-space-sm font-label-lg text-label-lg font-bold !text-white text-white shadow-sm transition-colors duration-200 hover:bg-landing-primary"
						href="/dashboard"
					>
						<span class="!text-white text-white">Dashboard</span>
					</a>
					<a
						href="/profile"
						class="inline-flex items-center rounded-full transition-transform hover:scale-105"
						title={`Profil ${displayName}`}
					>
						<Avatar.Root class="size-10 cursor-pointer border border-outline-variant/50 shadow-xs">
							<Avatar.Image src={avatarUrl} alt={displayName} />
							<Avatar.Fallback class="bg-primary-container font-bold !text-white text-white">
								{displayName.charAt(0).toUpperCase()}
							</Avatar.Fallback>
						</Avatar.Root>
					</a>
				</div>
			{:else}
				<a
					class="landing-btn-primary inline-flex items-center justify-center rounded-full bg-primary-container px-space-lg py-space-sm font-label-lg text-label-lg font-bold !text-white text-white shadow-sm transition-colors duration-200 hover:bg-landing-primary"
					href="/signin"
				>
					<span class="!text-white text-white">Login</span>
				</a>
			{/if}
		</div>
	</div>
</header>
