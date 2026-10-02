<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { ArcChart } from 'layerchart';
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

	const arcChartData = $derived([{ key: 'completed', value: progressPercentage }]);
</script>

<Card.Root class={`flex w-full flex-col justify-between ${className}`}>
	<Card.Header>
		<Card.Title class="flex items-center gap-3 font-semibold">
			<TrendingUpIcon class="size-4 text-sky-600" />
			Progress Kursus
		</Card.Title>
	</Card.Header>
	<Card.Content class="flex flex-1 flex-col justify-center space-y-2">
		<div class="flex items-center gap-4 py-2">
			<div class="relative flex size-32 shrink-0 items-center justify-center">
				<ArcChart
					data={arcChartData}
					maxValue={100}
					innerRadius={-18}
					cornerRadius={4}
					cRange={['#0284c7']}
				/>
				<span class="absolute text-lg font-extrabold text-slate-900 dark:text-slate-100">
					{progressPercentage}%
				</span>
			</div>
			<div class="flex-1 space-y-1">
				<p class="text-sm font-semibold text-slate-800 dark:text-slate-200">
					{completedCount} / {totalModules} Modul
				</p>
				<p class="text-sm text-slate-400 dark:text-slate-500">
					Level {course.level.code} - {course.title}
				</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>
