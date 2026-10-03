<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { ArrowLeftIcon } from 'lucide-svelte';
	import type { CourseDetail } from '../../domain/entities/course.entity';
	import CourseDetailActiveModuleCard from '../components/course-detail-active-module-card.svelte';
	import CourseDetailHeaderCard from '../components/course-detail-header-card.svelte';
	import CourseDetailModuleList from '../components/course-detail-module-list.svelte';
	import CourseDetailMotivationBanner from '../components/course-detail-motivation-banner.svelte';
	import CourseDetailProgressCard from '../components/course-detail-progress-card.svelte';
	import { updateModuleProgress } from '../remotes/update-module-progress.remote';

	interface Props {
		course: CourseDetail | null;
		errorMessage?: string | null;
	}

	let { course, errorMessage = null }: Props = $props();

	const modules = $derived(course?.modules ?? []);
	const completedCount = $derived(
		modules.filter((courseModule) => courseModule.status === 'completed').length
	);
	const progressPercentage = $derived(
		modules.length === 0 ? 0 : Math.round((completedCount / modules.length) * 100)
	);
	const nextModule = $derived(
		modules.find((courseModule) => courseModule.status === 'in_progress') ??
			modules.find((courseModule) => courseModule.status === 'unlocked' && courseModule.is_entry) ??
			modules.find((courseModule) => courseModule.status === 'unlocked') ??
			null
	);
	let progressError = $state<string | null>(null);
	let isOpeningLessons = $state(false);

	async function openLessons(): Promise<void> {
		if (!course || !nextModule || nextModule.status === 'locked' || isOpeningLessons) return;

		progressError = null;
		isOpeningLessons = true;

		try {
			if (nextModule.status === 'unlocked') {
				const result = await updateModuleProgress({
					courseId: course.id,
					moduleId: nextModule.id,
					status: 'in_progress'
				});

				if (!result.success) {
					throw new Error(result.message);
				}
			}

			await goto(resolve(`/courses/${course.id}/lessons`));
		} catch (error) {
			progressError = error instanceof Error ? error.message : 'Gagal membuka materi.';
			isOpeningLessons = false;
		}
	}
</script>

<svelte:head>
	<title>{course?.title ?? 'Kursus'} - Nihongo no Hikari</title>
	<meta name="description" content={course?.description ?? 'Detail kursus'} />
</svelte:head>

<div class="space-y-4 p-6">
	<div class="flex items-center gap-4">
		<Button variant="outline" size="icon" type="button" onclick={() => window.history.back()}>
			<ArrowLeftIcon />
		</Button>
		<p class="text-base font-semibold">Detail Kursus</p>
	</div>

	{#if errorMessage || !course}
		<Card.Root>
			<Card.Content class="py-10 text-center">
				<p class="font-semibold text-slate-900 dark:text-slate-100">Detail kursus tidak tersedia</p>
				<p class="mt-1 text-sm text-red-600 dark:text-red-400">
					{errorMessage ?? 'Data kursus tidak ditemukan.'}
				</p>
				<Button class="mt-5" type="button" onclick={() => goto(resolve('/courses'))}>
					Kembali ke daftar kursus
				</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
			{#if progressError}
				<p class="text-sm text-red-600 lg:col-span-12 dark:text-red-400">{progressError}</p>
			{/if}
			<div class="flex lg:col-span-9">
				<CourseDetailHeaderCard {course} />
			</div>

			<div class="flex lg:col-span-3">
				<CourseDetailProgressCard
					{course}
					{completedCount}
					totalModules={modules.length}
					{progressPercentage}
				/>
			</div>

			<div class="flex lg:col-span-9">
				<div class="flex w-full flex-col gap-4">
					<CourseDetailModuleList {modules} activeModuleId={nextModule?.id ?? null} />
					<CourseDetailMotivationBanner />
				</div>
			</div>

			<div class="lg:col-span-3">
				<CourseDetailActiveModuleCard
					activeModule={nextModule}
					onOpenLessons={openLessons}
					{isOpeningLessons}
				/>
			</div>
		</div>
	{/if}
</div>
