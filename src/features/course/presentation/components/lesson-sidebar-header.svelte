<script lang="ts">
	import { Progress } from '$lib/components/ui/progress';

	interface Props {
		courseName?: string;
		completedLessons?: number;
		totalLessons?: number;
	}

	let {
		courseName = 'JLPT N5: Dasar Bahasa Jepang & Kana',
		completedLessons = 8,
		totalLessons = 131
	}: Props = $props();

	const progressPercentage = $derived(
		totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
	);
</script>

<div class="px-4 pt-4 pb-3">
	<h2 class="mb-3 text-base leading-snug font-bold text-foreground">{courseName}</h2>

	<div class="flex flex-col gap-1.5">
		<div class="flex items-center justify-between">
			<span class="text-sm text-muted-foreground">
				{completedLessons} / {totalLessons} Pelajaran
			</span>
			<span class="text-sm text-taupe-500 dark:text-taupe-400">{progressPercentage}%</span>
		</div>
		<Progress value={progressPercentage} max={100} class="h-1.5 bg-taupe-100 dark:bg-taupe-800" />
	</div>
</div>
