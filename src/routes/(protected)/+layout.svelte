<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import { navigating, page } from '$app/state';
	import {
		setCourseLearningContext,
		type CourseLearningSelection
	} from '$features/course/presentation/contexts/course-learning-context';
	import type { AttemptResponse } from '$features/question/domain/entities/question.entity';
	import { setAssessmentContext } from '$features/question/presentation/contexts/assessment-context';
	import AssessmentAppBar from '$features/question/presentation/components/assessment-app-bar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import { Button } from '$lib/components/ui/button';
	import { BellIcon, ChevronDownIcon, LoaderCircle } from 'lucide-svelte';
	import type { LayoutProps } from './$types';

	interface AssessmentPageData {
		backHref: string;
		errorMessage: string | null;
	}

	let { data, children }: LayoutProps = $props();

	const storageKeyPrefix = 'course-learning-selection:';
	const courseLearningSelection = $state<CourseLearningSelection>({
		course: null,
		module: null
	});
	let isSigningOut = $state(false);
	let signOutError = $state(false);
	let attemptResponse = $state<AttemptResponse | null>(null);
	const displayName = $derived(data.user?.display_name ?? 'Pengguna');
	const firstName = $derived(displayName.trim().split(/\s+/)[0] || 'Pengguna');
	const isAssessmentRoute = $derived(
		page.route.id?.startsWith('/(protected)/exam') === true ||
			page.route.id?.startsWith('/(protected)/practice') === true
	);
	const assessmentData = $derived(page.data as Partial<AssessmentPageData>);
	const activeAssessmentAttempt = $derived.by(() => {
		const response = attemptResponse;
		if (!response) return null;

		return response.data.question_set.id === page.params.id ? response.data : null;
	});
	function getStorageKey(courseId: string): string {
		return `${storageKeyPrefix}${courseId}`;
	}

	function clearCourseLearningSelection(): void {
		courseLearningSelection.course = null;
		courseLearningSelection.module = null;
	}

	function restoreCourseLearningSelection(courseId: string): void {
		try {
			const serializedSelection = sessionStorage.getItem(getStorageKey(courseId));
			if (!serializedSelection) {
				clearCourseLearningSelection();
				return;
			}

			const storedSelection = JSON.parse(serializedSelection) as CourseLearningSelection;
			if (storedSelection.course?.id !== courseId || !storedSelection.module?.id) {
				sessionStorage.removeItem(getStorageKey(courseId));
				clearCourseLearningSelection();
				return;
			}

			courseLearningSelection.course = storedSelection.course;
			courseLearningSelection.module = storedSelection.module;
		} catch {
			clearCourseLearningSelection();
		}
	}

	function persistCourseLearningSelection(nextSelection: CourseLearningSelection): void {
		if (!browser || !nextSelection.course || !nextSelection.module) return;

		try {
			sessionStorage.setItem(getStorageKey(nextSelection.course.id), JSON.stringify(nextSelection));
		} catch {
			// Context remains usable when storage is unavailable or full.
		}
	}

	$effect(() => {
		const routeId = page.route.id;
		const courseId =
			page.url.searchParams.get('courseId') ??
			(routeId?.includes('/courses/[id]') ? page.params.id : null);
		if (browser && courseId) restoreCourseLearningSelection(courseId);
	});

	setCourseLearningContext({
		get course() {
			return courseLearningSelection.course;
		},
		get module() {
			return courseLearningSelection.module;
		},
		select(course, module) {
			courseLearningSelection.course = course;
			courseLearningSelection.module = module;
			persistCourseLearningSelection({ course, module });
		}
	});

	setAssessmentContext({
		get attemptResponse() {
			return attemptResponse;
		},
		setAttemptResponse(response) {
			attemptResponse = response;
		},
		clearAttemptResponse() {
			attemptResponse = null;
		}
	});

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

{#if isAssessmentRoute}
	{#if navigating.to}
		<div
			class="absolute inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-sky-100"
			role="progressbar"
			aria-label="Memuat halaman"
		>
			<div class="route-progress-indicator h-full bg-sky-500"></div>
		</div>
	{/if}
	<div class="flex h-svh min-w-0 flex-col overflow-hidden">
		<AssessmentAppBar
			title={activeAssessmentAttempt?.question_set.title ?? 'Assessment Bahasa Jepang'}
			questionCount={activeAssessmentAttempt?.question_set.question_count ?? 0}
			passingScore={activeAssessmentAttempt?.question_set.passing_score ?? 0}
			backHref={assessmentData.backHref ?? '/courses'}
		/>
		<section class="min-h-0 flex-1 overflow-y-auto bg-neutral-100">
			{@render children?.()}
		</section>
	</div>
{:else}
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
{/if}

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
