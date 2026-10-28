<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { ClockIcon, BookOpenIcon, ArrowRightIcon } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Course } from '../../domain/entities/course.entity';

	type Props = Course & {
		/** Enrollment status */
		isEnrolled?: boolean;
		class?: string;
	};

	let {
		id,
		slug,
		level,
		title,
		description,
		total_minutes: totalMinutes,
		total_lessons: totalLessons,
		thumbnail_url: coverImage,
		isEnrolled = false,
		class: className = ''
	}: Props = $props();

	// Format display values for hours & materials
	const formattedHours = $derived(`${totalMinutes / 60} Jam`);
	const formattedLessons = $derived(
		typeof totalLessons === 'number' ? `${totalLessons} Materi` : totalLessons
	);
</script>

<Card.Root class={`group h-full justify-between ${className}`}>
	<!-- Header / Top Section -->
	<Card.Content>
		<!-- Top Meta: Level Tag & Category -->
		<div class="mb-3.5 flex items-center justify-between gap-2">
			<!-- Level Badge (N5) -->
			<span
				class="flex items-center justify-center rounded-lg bg-taupe-500 px-3 py-1 text-xs font-bold tracking-wide text-white shadow-xs shadow-taupe-500/30"
			>
				{level.code}
			</span>

			<!-- Category Tag -->
			{#if level.name}
				<Badge
					variant="outline"
					class="border-taupe-200 bg-taupe-50/50 text-taupe-700 dark:border-taupe-900/50 dark:bg-taupe-950/30 dark:text-taupe-300"
				>
					{level.name}
				</Badge>
			{/if}
		</div>

		<!-- Optional Cover Image -->
		{#if coverImage}
			<div class="mb-4 aspect-video overflow-hidden rounded-xl bg-taupe-100">
				<img
					src={coverImage}
					alt={title}
					class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
			</div>
		{/if}

		<!-- Course Title -->
		<Card.Title role="heading" aria-level={3} class="mb-2 text-xl tracking-tight">
			{title}
		</Card.Title>

		<!-- Course Description -->
		<Card.Description class="line-clamp-3">
			{description}
		</Card.Description>
	</Card.Content>

	<!-- Bottom Section: Stats & Action Button -->
	<Card.Footer class="flex-wrap justify-between gap-4 pb-7">
		<!-- Course Meta Info: Jam Belajar & Jumlah Materi -->
		<div class="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
			<!-- Total Jam Belajar -->
			<div class="flex items-center gap-1.5">
				<ClockIcon class="size-4" />
				<span>{formattedHours}</span>
			</div>

			<!-- Jumlah Materi -->
			<div class="flex items-center gap-1.5">
				<BookOpenIcon class="size-4" />
				<span>{formattedLessons}</span>
			</div>
		</div>

		<!-- Enroll Button -->
		<Button
			type="button"
			variant={isEnrolled ? 'secondary' : 'default'}
			onclick={() => goto(resolve(`/courses/${id}`))}
			disabled={!slug}
			class="ml-auto"
		>
			{#if isEnrolled}
				Terdaftar
				<ArrowRightIcon class="group-hover:trantaupe-x-1 size-4 transition-transform" />
			{:else}
				Lihat Detail
				<ArrowRightIcon class="group-hover:trantaupe-x-1 size-4 transition-transform" />
			{/if}
		</Button>
	</Card.Footer>
</Card.Root>
