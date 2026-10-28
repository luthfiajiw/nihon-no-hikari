<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { TrendingUpIcon } from 'lucide-svelte';
	import type { CourseDetail } from '../../domain/entities/course.entity';

	interface Props {
		course: CourseDetail;
		completedCount: number;
		totalModules: number;
		progressPercentage: number;
		class?: string;
	}

	let {
		course,
		completedCount,
		totalModules,
		progressPercentage,
		class: className = ''
	}: Props = $props();
</script>

<Card.Root class={`flex w-full flex-col justify-between ${className}`}>
	<Card.Header>
		<Card.Title class="flex items-center gap-3 font-semibold">
			<TrendingUpIcon class="size-4 text-taupe-500" />
			Progress Kursus
		</Card.Title>
	</Card.Header>
	<Card.Content class="flex flex-1 flex-col justify-center space-y-2">
		<div class="flex flex-wrap items-center justify-center gap-4 py-2">
			<div
				class="relative flex size-32 shrink-0 items-center justify-center"
				role="progressbar"
				aria-label="Progres kursus"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={progressPercentage}
			>
				<svg class="size-full -rotate-90 text-taupe-500" viewBox="0 0 128 128" aria-hidden="true">
					<circle
						cx="64"
						cy="64"
						r="55"
						fill="none"
						stroke="currentColor"
						stroke-width="18"
						opacity="0.1"
					/>
					<circle
						cx="64"
						cy="64"
						r="55"
						fill="none"
						stroke="currentColor"
						stroke-width="18"
						pathLength="100"
						stroke-dasharray={`${progressPercentage} 100`}
					/>
				</svg>
				<span class="absolute text-lg font-extrabold text-taupe-900 dark:text-taupe-100">
					{progressPercentage}%
				</span>
			</div>
			<div class="min-w-0 flex-1 basis-24 space-y-1">
				<p class="text-sm font-semibold text-taupe-800 dark:text-taupe-200">
					{completedCount} / {totalModules} Modul
				</p>
				<p class="text-sm text-taupe-400 dark:text-taupe-500">
					Level {course.level.code} - {course.title}
				</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>
