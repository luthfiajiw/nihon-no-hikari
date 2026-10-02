<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { ClockIcon, BookOpenIcon, ArrowRightIcon } from 'lucide-svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
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

<div
	class={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${className}`}
>
	<!-- Header / Top Section -->
	<div class="px-4 pt-5">
		<!-- Top Meta: Level Tag & Category -->
		<div class="mb-3.5 flex items-center justify-between gap-2">
			<!-- Level Badge (N5) -->
			<span
				class="flex items-center justify-center rounded-lg bg-sky-600 px-3 py-1 text-xs font-bold tracking-wide text-white shadow-xs shadow-sky-600/30"
			>
				{level.code}
			</span>

			<!-- Category Tag -->
			{#if level.name}
				<Badge
					variant="outline"
					class="border-sky-200 bg-sky-50/50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300"
				>
					{level.name}
				</Badge>
			{/if}
		</div>

		<!-- Optional Cover Image -->
		{#if coverImage}
			<div class="mb-4 aspect-video overflow-hidden rounded-xl bg-slate-100">
				<img
					src={coverImage}
					alt={title}
					class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
			</div>
		{/if}

		<!-- Course Title -->
		<h3
			class="mb-2 text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-sky-600 dark:text-slate-100 dark:group-hover:text-sky-400"
		>
			{title}
		</h3>

		<!-- Course Description -->
		<p class="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
			{description}
		</p>
	</div>

	<div class="px-4">
		<Separator orientation="horizontal" class="h-px w-full" />
	</div>

	<!-- Bottom Section: Stats & Action Button -->
	<div
		class="flex items-center justify-between gap-2 border-slate-100 px-5 pt-4 pb-5 dark:border-slate-800/80"
	>
		<!-- Course Meta Info: Jam Belajar & Jumlah Materi -->
		<div class="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
			<!-- Total Jam Belajar -->
			<div
				class="flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1.5 dark:bg-slate-800/60"
			>
				<ClockIcon class="size-4" />
				<span>{formattedHours}</span>
			</div>

			<!-- Jumlah Materi -->
			<div
				class="flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1.5 dark:bg-slate-800/60"
			>
				<BookOpenIcon class="size-4" />
				<span>{formattedLessons}</span>
			</div>
		</div>

		<!-- Enroll Button -->
		<Button
			type="button"
			onclick={() => goto(resolve(`/courses/${id}`))}
			disabled={!slug}
			class={`font-semibold transition-all duration-200 ${
				isEnrolled
					? 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
					: 'text-white active:scale-[0.99]'
			}`}
		>
			{#if isEnrolled}
				Terdaftar
				<ArrowRightIcon
					class="ml-1.5 size-4 text-sky-500 transition-transform group-hover:translate-x-1"
				/>
			{:else}
				Lihat Detail
				<ArrowRightIcon class="ml-1.5 size-4 transition-transform group-hover:translate-x-1" />
			{/if}
		</Button>
	</div>
</div>
