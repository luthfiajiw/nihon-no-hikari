<script lang="ts">
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import { page } from "$app/state";

	let { children } = $props();

	/** Map from URL path segment to display name */
	const routeNameMap: Record<string, string> = {
		"": "Dashboard",
		"courses": "Kursus",
		"latihan": "Latihan",
		"kosakata": "Kosakata",
		"tata-bahasa": "Tata Bahasa",
		"kanji": "Kanji",
		"ujian": "Ujian & Evaluasi",
		"progress": "Progress",
		"komunitas": "Komunitas",
		"pengaturan": "Pengaturan",
		"bantuan": "Bantuan",
	};

	function getSegmentName(segment: string): string {
		return routeNameMap[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
	}

	interface BreadcrumbSegment {
		name: string;
		href: string;
	}

	function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
		const segments = pathname.split("/").filter(Boolean);

		// Root page → single "Dashboard" breadcrumb
		if (segments.length === 0) {
			return [{ name: "Dashboard", href: "/" }];
		}

		const crumbs: BreadcrumbSegment[] = [];
		let accumulated = "";

		for (const segment of segments) {
			accumulated += `/${segment}`;
			crumbs.push({
				name: getSegmentName(segment),
				href: accumulated,
			});
		}

		return crumbs;
	}

	let breadcrumbs = $derived(getBreadcrumbs(page.url.pathname));
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset class="h-svh overflow-hidden">
    <header
      class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 shadow-md"
    >
      <div class="flex items-center gap-2 px-4">
        <Sidebar.Trigger class="-ms-1" />
        <Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb.Root>
          <Breadcrumb.List>
            {#each breadcrumbs as crumb, i (crumb.href)}
              {#if i > 0}
                <Breadcrumb.Separator class="hidden md:block" />
              {/if}
              <Breadcrumb.Item class="hidden md:block">
                {#if i < breadcrumbs.length - 1}
                  <Breadcrumb.Link href={crumb.href}>{crumb.name}</Breadcrumb.Link>
                {:else}
                  <Breadcrumb.Page>{crumb.name}</Breadcrumb.Page>
                {/if}
              </Breadcrumb.Item>
            {/each}
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </div>
    </header>
    <section class="h-[calc(100svh-4rem)] group-has-data-[collapsible=icon]/sidebar-wrapper:h-[calc(100svh-3rem)] flex-1 min-h-0 overflow-y-auto bg-secondary">
			{@render children?.()}
		</section>
  </Sidebar.Inset>
</Sidebar.Provider>

