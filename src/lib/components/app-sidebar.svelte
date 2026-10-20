<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { page } from '$app/state';
	import type { AuthUser } from '$features/auth/domain/entities/auth.entity';
	import { cn } from '$lib/utils.js';
	import logo from '$lib/assets/images/nnh-logo.png';
	import bgSidebar from '$lib/assets/images/bg-sidebar.png';
	import kanjiIcon from '$lib/assets/icons/kanji.svg';
	import kanjiActiveIcon from '$lib/assets/icons/kanji-active.svg';
	import {
		House,
		BookOpen,
		Zap,
		BookText,
		Languages,
		ClipboardCheck,
		FileText,
		ChartColumn,
		Settings,
		CircleQuestionMark,
		Users,
		ArrowUpRight
	} from 'lucide-svelte';

	let {
		mode = 'student',
		ref = $bindable(null),
		collapsible = 'icon',
		class: className,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { mode?: 'student' | 'admin' } = $props();
	const adminNav = [
		{ name: 'Ringkasan', url: '/admin', icon: House },
		{ name: 'Kursus & Materi', url: '/admin/courses', icon: BookOpen },
		{ name: 'Question Sets', url: '/admin/question-sets', icon: ClipboardCheck },
		{ name: 'Template Kana', url: '/admin/kana-templates', icon: FileText },
		{ name: 'Pengguna', url: '/admin/users', icon: Users }
	];

	const mainNav = [
		{
			name: 'Dashboard',
			url: '/',
			icon: House
		},
		{
			name: 'Kursus',
			url: '/courses',
			icon: BookOpen
		},
		{
			name: 'Latihan',
			url: '/practice',
			icon: Zap
		},
		{
			name: 'Kosakata',
			url: '/kosakata',
			icon: Languages
		},
		{
			name: 'Tata Bahasa',
			url: '/tata-bahasa',
			icon: BookText
		},
		{
			name: 'Kanji',
			url: '/kanji',
			icon: Languages
		},
		{
			name: 'Ujian & Evaluasi',
			url: '/exam',
			icon: ClipboardCheck
		},
		{
			name: 'Progress',
			url: '/progress',
			icon: ChartColumn
		}
	];

	const secondaryNav = [
		{
			name: 'Pengaturan',
			url: '/pengaturan',
			icon: Settings
		},
		{
			name: 'Bantuan',
			url: '/bantuan',
			icon: CircleQuestionMark
		}
	];
	const isAdmin = $derived((page.data.user as AuthUser | undefined)?.role === 'Admin');

	function isItemActive(url: string): boolean {
		const currentPath = page.url.pathname;
		if (mode === 'admin') {
			if (url === '/admin') return currentPath === url;
			if (url === '/admin/question-sets')
				return currentPath.startsWith(url) || currentPath.startsWith('/admin/content/question_set');
			if (url === '/admin/courses')
				return (
					currentPath.startsWith(url) ||
					/^\/admin\/content\/(course|module|lesson)\//.test(currentPath)
				);
		}
		if (url === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(url);
	}
</script>

<Sidebar.Root bind:ref {collapsible} class={cn('', className)} {...restProps}>
	<Sidebar.Header
		class="bg-sidebar flex flex-row items-center gap-3 p-5.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-3"
	>
		<img src={logo} alt="NihongoPro Logo" class="h-6 w-6 shrink-0 object-contain" />
		<div class="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
			<h1
				class="font-retro text-lg leading-tight font-bold tracking-tight text-slate-900 dark:text-slate-100"
			>
				日本 の 光
			</h1>
			{#if mode === 'admin'}
				<p class="text-[10px] font-semibold tracking-[0.16em] text-slate-500">PANEL ADMIN</p>
			{/if}
		</div>
	</Sidebar.Header>

	<Sidebar.Content
		class="bg-sidebar flex h-full flex-col px-3 pt-2 group-data-[collapsible=icon]:px-2"
	>
		<Sidebar.Group class="p-0">
			<Sidebar.Menu class="space-y-2">
				{#each mode === 'admin' ? adminNav : mainNav as item (item.name)}
					{@const active = isItemActive(item.url)}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							isActive={active}
							tooltipContent={item.name}
							class="h-10 rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0! hover:bg-slate-100/80 hover:text-slate-900 data-[active=true]:bg-sky-50 data-[active=true]:font-semibold data-[active=true]:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:data-[active=true]:bg-sky-950/60 dark:data-[active=true]:text-sky-400 [&_svg]:size-4 [&_svg]:shrink-0"
						>
							{#snippet child({ props })}
								<button
									type="button"
									{...props}
									onclick={() => goto(resolve(item.url as Pathname))}
								>
									{#if item.url === '/kanji'}
										<img
											src={active ? kanjiActiveIcon : kanjiIcon}
											alt="Kanji"
											class={cn('mr-1 size-4 shrink-0 transition-all')}
										/>
									{:else}
										<item.icon
											class={cn(
												'mr-1 size-4 shrink-0 transition-colors',
												active
													? 'text-sky-600 dark:text-sky-400'
													: 'text-slate-600 dark:text-slate-400'
											)}
										/>
									{/if}
									<span class="group-data-[collapsible=icon]:hidden">{item.name}</span>
								</button>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
		{#if isAdmin && mode !== 'admin'}
			<Sidebar.Group class="p-0 pt-2">
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton isActive={isItemActive('/admin')} tooltipContent="Panel Admin">
							{#snippet child({ props })}
								<button type="button" {...props} onclick={() => goto(resolve('/admin'))}>
									<Users class="mr-1 size-4" />
									<span class="group-data-[collapsible=icon]:hidden">Panel Admin</span>
								</button>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.Group>
		{/if}

		{#if mode === 'admin'}
			<div class="mt-5 border-t border-slate-100 pt-5">
				<button
					type="button"
					onclick={() => goto(resolve('/'))}
					class="flex w-full items-center gap-2 rounded-xl border border-sky-200 px-3 py-3 text-sm font-medium text-sky-600 group-data-[collapsible=icon]:justify-center hover:bg-sky-50"
				>
					<ArrowUpRight class="size-4 shrink-0" />
					<span class="group-data-[collapsible=icon]:hidden">Lihat tampilan siswa</span>
				</button>
			</div>
		{:else}
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
									class="h-10 rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0! hover:bg-slate-100/80 hover:text-slate-900 data-[active=true]:bg-sky-50 data-[active=true]:font-semibold data-[active=true]:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:data-[active=true]:bg-sky-950/60 dark:data-[active=true]:text-sky-400 [&_svg]:size-5 [&_svg]:shrink-0"
								>
									{#snippet child({ props })}
										<button
											type="button"
											{...props}
											onclick={() => goto(resolve(item.url as Pathname))}
										>
											<item.icon
												class={cn(
													'mr-1 size-5 shrink-0 transition-colors',
													active
														? 'text-sky-600 dark:text-sky-400'
														: 'text-slate-600 dark:text-slate-400'
												)}
											/>
											<span class="group-data-[collapsible=icon]:hidden">{item.name}</span>
										</button>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.Group>
			</div>
		{/if}

		<!-- Background image pushed to bottom of scrollable area -->
		<div class="pointer-events-none -mx-3 mt-auto select-none group-data-[collapsible=icon]:hidden">
			<img src={bgSidebar} alt="" class="w-full object-contain object-bottom" />
		</div>
	</Sidebar.Content>
</Sidebar.Root>
