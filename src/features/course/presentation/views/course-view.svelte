<script lang="ts">
	import type { Course } from '../../domain/entities/course.entity';
	import CourseHeroBanner from '../components/course-hero-banner.svelte';
	import CourseProgressCard from '../components/course-progress-card.svelte';
	import CourseTile from '../components/course-tile.svelte';
	import * as Card from '$lib/components/ui/card';

	interface Props {
		courses: Course[];
		errorMessage?: string | null;
	}

	let { courses, errorMessage = null }: Props = $props();
</script>

<div class="space-y-8 p-4 pb-6 sm:p-6 sm:pb-8">
	<!-- Row 1: Hero Banner (8 cols) + Progress Card (4 cols) -->
	<div class="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
		<div class="flex lg:col-span-8">
			<CourseHeroBanner class="w-full" />
		</div>
		<aside class="flex lg:col-span-4">
			<CourseProgressCard class="h-full w-full" />
		</aside>

		<div class="lg:col-span-8">
			<div class="flex flex-col space-y-4">
				<h2 class="text-xl font-bold text-taupe-800 dark:text-taupe-100">Daftar Kursus</h2>
				{#if errorMessage}
					<div
						class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
					>
						{errorMessage}
					</div>
				{:else if courses.length === 0}
					<Card.Root>
						<Card.Content class="py-4 text-center">
							<Card.Description>Belum ada kursus yang tersedia.</Card.Description>
						</Card.Content>
					</Card.Root>
				{:else}
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						{#each courses as course (course.id)}
							<CourseTile {...course} />
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
