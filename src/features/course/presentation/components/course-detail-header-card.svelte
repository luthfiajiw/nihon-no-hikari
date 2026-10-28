<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { BookOpenIcon, ClockIcon, UserIcon } from 'lucide-svelte';
	import type { CourseDetail } from '../../domain/entities/course.entity';
	import { formatDuration } from '$lib/course-format';

	interface Props {
		course: CourseDetail;
		class?: string;
	}

	let { course, class: className = '' }: Props = $props();
</script>

<Card.Root class={`w-full justify-between ${className}`}>
	<Card.Content class="flex flex-1 flex-col justify-between">
		<div class="max-w-2xl space-y-3">
			<div class="flex flex-col items-start gap-2">
				<Badge
					class="rounded-lg border-none bg-emerald-500 px-3 py-1 text-xs font-extrabold text-white shadow-xs shadow-emerald-500/30 hover:bg-emerald-600"
				>
					{course.level.code}
				</Badge>
				<h1 class="text-2xl font-bold tracking-tight text-taupe-900 dark:text-taupe-50">
					{course.title}
				</h1>
			</div>

			<p class="text-sm leading-relaxed text-taupe-600 sm:text-base dark:text-taupe-400">
				{course.description}
			</p>

			<div class="flex flex-wrap items-center gap-3 pt-2">
				<div
					class="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-taupe-700 dark:bg-taupe-800/60 dark:text-taupe-300"
				>
					<BookOpenIcon class="size-4 text-taupe-500" />
					<span>{course.total_lessons} Materi</span>
				</div>
				<div
					class="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-taupe-700 dark:bg-taupe-800/60 dark:text-taupe-300"
				>
					<ClockIcon class="size-4 text-taupe-500" />
					<span>{formatDuration(course.total_minutes)}</span>
				</div>
				<div
					class="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-taupe-700 dark:bg-taupe-800/60 dark:text-taupe-300"
				>
					<UserIcon class="size-4 text-taupe-500" />
					<span>{course.level.name}</span>
				</div>
			</div>
		</div>
	</Card.Content>
</Card.Root>
