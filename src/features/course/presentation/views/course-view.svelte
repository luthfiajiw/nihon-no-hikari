<script lang="ts">
	import type { Course } from '../../domain/entities/course.entity';
	import CourseHeroBanner from '../components/course-hero-banner.svelte';
	import CourseProgressCard from '../components/course-progress-card.svelte';
	import CourseTile from '../components/course-tile.svelte';

	interface Props {
		courses: Course[];
		errorMessage?: string | null;
	}

	let { courses, errorMessage = null }: Props = $props();
</script>

<div class="space-y-6 p-6">
	<!-- Row 1: Hero Banner (8 cols) + Progress Card (4 cols) -->
	<div class="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
		<div class="flex lg:col-span-8">
			<CourseHeroBanner class="w-full" />
		</div>
		<aside class="flex lg:col-span-4">
			<CourseProgressCard class="h-full w-full" />
		</aside>

		<div class="lg:col-span-8">
			<div class="flex flex-col space-y-4">
				<h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">Daftar Kursus</h2>
				{#if errorMessage}
					<div
						class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
					>
						{errorMessage}
					</div>
				{:else if courses.length === 0}
					<div
						class="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
					>
						Belum ada kursus yang tersedia.
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						{#each courses as course (course.id)}
							<CourseTile
								slug={course.slug}
								level={course.level.code}
								title={course.title}
								description={course.description}
								totalHours={course.total_hours}
								totalLessons={course.total_lessons}
								coverImage={course.thumbnail_url}
								category={course.level.name}
							/>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
