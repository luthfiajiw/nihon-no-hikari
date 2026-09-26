<script lang="ts">
	import { Progress } from "$lib/components/ui/progress";

	interface Props {
		courseName?: string;
		completedLessons?: number;
		totalLessons?: number;
	}

	let {
		courseName = "JLPT N5: Dasar Bahasa Jepang & Kana",
		completedLessons = 8,
		totalLessons = 131,
	}: Props = $props();

	const progressPercentage = $derived(
		totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
	);
</script>

<div class="p-4">
	<h2 class="text-xs mb-3 sm:text-sm font-bold text-foreground leading-snug">{courseName}</h2>

	<div class="flex flex-col gap-1.5">
		<div class="flex items-center justify-between">
			<span class="text-[11px] font-medium text-muted-foreground">{completedLessons} / {totalLessons} modul</span>
			<span class="text-[11px] font-bold text-sky-600 dark:text-sky-400">{progressPercentage}%</span>
		</div>
		<Progress value={progressPercentage} max={100} class="h-1.5 bg-slate-100 dark:bg-slate-800" />
	</div>
</div>
