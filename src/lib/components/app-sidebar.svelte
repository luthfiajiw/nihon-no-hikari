<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { ComponentProps } from "svelte";
	import { resolve } from "$app/paths";
	import type { Pathname } from "$app/types";
	import { page } from "$app/state";
	import { cn } from "$lib/utils.js";
	import logo from "$lib/assets/images/nnh-logo.png";
	import bgSidebar from "$lib/assets/images/bg-sidebar.png";
	import kanjiIcon from "$lib/assets/icons/kanji.svg";
	import kanjiActiveIcon from "$lib/assets/icons/kanji-active.svg";
	import {
		House,
		BookOpen,
		Zap,
		BookText,
		Languages,
		ClipboardCheck,
		ChartColumn,
		Settings,
		CircleQuestionMark
	} from "lucide-svelte";

	let {
		ref = $bindable(null),
		collapsible = "icon",
		class: className,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();

	const mainNav = [
		{
			name: "Dashboard",
			url: "/",
			icon: House
		},
		{
			name: "Kursus",
			url: "/courses",
			icon: BookOpen
		},
		{
			name: "Latihan",
			url: "/latihan",
			icon: Zap
		},
		{
			name: "Kosakata",
			url: "/kosakata",
			icon: Languages
		},
		{
			name: "Tata Bahasa",
			url: "/tata-bahasa",
			icon: BookText
		},
		{
			name: "Kanji",
			url: "/kanji",
			icon: Languages
		},
		{
			name: "Ujian & Evaluasi",
			url: "/ujian",
			icon: ClipboardCheck
		},
		{
			name: "Progress",
			url: "/progress",
			icon: ChartColumn
		}
	];

	const secondaryNav = [
		{
			name: "Pengaturan",
			url: "/pengaturan",
			icon: Settings
		},
		{
			name: "Bantuan",
			url: "/bantuan",
			icon: CircleQuestionMark
		}
	];

	function isItemActive(url: string): boolean {
		const currentPath = page.url.pathname;
		if (url === "/") {
			return currentPath === "/";
		}
		return currentPath.startsWith(url);
	}
</script>

<Sidebar.Root bind:ref {collapsible} class={cn("", className)} {...restProps}>
	<Sidebar.Header class="flex flex-row items-center gap-3 p-[22px] group-data-[collapsible=icon]:p-3 group-data-[collapsible=icon]:justify-center bg-white">
		<img src={logo} alt="NihongoPro Logo" class="h-6 w-6 shrink-0 object-contain" />
		<div class="flex flex-col group-data-[collapsible=icon]:hidden gap-1">
			<h1 class="font-retro text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
				日本 の 光
			</h1>
		</div>
	</Sidebar.Header>

	<Sidebar.Content class="flex h-full flex-col px-3 pt-2 group-data-[collapsible=icon]:px-2 bg-white">
		<Sidebar.Group class="p-0">
			<Sidebar.Menu class="space-y-2">
				{#each mainNav as item (item.name)}
					{@const active = isItemActive(item.url)}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							isActive={active}
							tooltipContent={item.name}
							class="h-10 rounded-xl px-3 text-sm font-medium transition-colors text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 data-[active=true]:bg-blue-50 data-[active=true]:font-semibold data-[active=true]:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:data-[active=true]:bg-blue-950/60 dark:data-[active=true]:text-blue-400 [&_svg]:size-4 [&_svg]:shrink-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0!"
						>
							{#snippet child({ props })}
								<a href={resolve(item.url as Pathname)} {...props}>
									{#if item.url === "/kanji"}
										<img
											src={active ? kanjiActiveIcon : kanjiIcon}
											alt="Kanji"
											class={cn(
												"size-4 shrink-0 transition-all mr-1",
											)}
										/>
									{:else}
										<item.icon
											class={cn(
												"size-4 shrink-0 transition-colors mr-1",
												active ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"
											)}
										/>
									{/if}
									<span class="group-data-[collapsible=icon]:hidden">{item.name}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>

		<div class="pt-2">
			<div class="my-3 border-t border-slate-100 dark:border-slate-800"></div>
			<Sidebar.Group class="p-0">
				<Sidebar.Menu class="space-y-2">
					{#each secondaryNav as item (item.name)}
						{@const active = isItemActive(item.url)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								isActive={active}
								tooltipContent={item.name}
								class="h-10 rounded-xl px-3 text-sm font-medium transition-colors text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 data-[active=true]:bg-blue-50 data-[active=true]:font-semibold data-[active=true]:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:data-[active=true]:bg-blue-950/60 dark:data-[active=true]:text-blue-400 [&_svg]:size-5 [&_svg]:shrink-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0!"
							>
								{#snippet child({ props })}
									<a href={resolve(item.url as Pathname)} {...props}>
										<item.icon
											class={cn(
												"size-5 shrink-0 transition-colors mr-1",
												active ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"
											)}
										/>
										<span class="group-data-[collapsible=icon]:hidden">{item.name}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.Group>
		</div>

		<!-- Background image pushed to bottom of scrollable area -->
		<div class="mt-auto pointer-events-none select-none group-data-[collapsible=icon]:hidden -mx-3">
			<img
				src={bgSidebar}
				alt=""
				class="w-full object-contain object-bottom"
			/>
		</div>
	</Sidebar.Content>
</Sidebar.Root>