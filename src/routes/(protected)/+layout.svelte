<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import { Button } from "$lib/components/ui/button";
	import { BellIcon, ChevronDownIcon } from "lucide-svelte";

	let { children } = $props();

	/** Map from URL path segment to display name */
	// const routeNameMap: Record<string, string> = {
	// 	"": "Dashboard",
	// 	"courses": "Kursus",
	// 	"latihan": "Latihan",
	// 	"kosakata": "Kosakata",
	// 	"tata-bahasa": "Tata Bahasa",
	// 	"kanji": "Kanji",
	// 	"ujian": "Ujian & Evaluasi",
	// 	"progress": "Progress",
	// 	"komunitas": "Komunitas",
	// 	"pengaturan": "Pengaturan",
	// 	"bantuan": "Bantuan",
	// };

	// function getSegmentName(segment: string): string {
	// 	return routeNameMap[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
	// }

	// interface BreadcrumbSegment {
	// 	name: string;
	// 	href: string;
	// }

	// function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
	// 	const segments = pathname.split("/").filter(Boolean);

	// 	// Root page → single "Dashboard" breadcrumb
	// 	if (segments.length === 0) {
	// 		return [{ name: "Dashboard", href: "/" }];
	// 	}

	// 	const crumbs: BreadcrumbSegment[] = [];
	// 	let accumulated = "";

	// 	for (const segment of segments) {
	// 		accumulated += `/${segment}`;
	// 		crumbs.push({
	// 			name: getSegmentName(segment),
	// 			href: accumulated,
	// 		});
	// 	}

	// 	return crumbs;
	// }

	// let breadcrumbs = $derived(getBreadcrumbs(page.url.pathname));
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset class="h-svh overflow-hidden">
    <header
      class="flex h-16 shrink-0 items-center border-b justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
    >
      <div class="flex items-center gap-2 px-4">
        <Sidebar.Trigger />
        <p class="pl-1 text-base">Ganbare, Wicaksono!</p>
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
									<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
									<Avatar.Fallback>CN</Avatar.Fallback>
								</Avatar.Root>

								<div class="flex flex-col items-start pl-3 pr-4">
									<p class="font-medium text-sm">Luthfi Aji</p>
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
						<DropdownMenu.Item class="text-destructive">
							Keluar
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

