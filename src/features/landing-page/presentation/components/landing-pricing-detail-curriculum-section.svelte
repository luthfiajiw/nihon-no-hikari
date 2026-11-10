<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion';
	import type { PricingDetail } from '$features/landing-page/domain/entities/landing-pricing.entity';
	import { BookOpen, Clock, ChevronDown } from 'lucide-svelte';

	interface Props {
		detail: PricingDetail;
	}

	let { detail }: Props = $props();

	function formatDuration(estimatedMinutes: number): string {
		if (!estimatedMinutes || estimatedMinutes <= 0) return 'Pelajaran Mandiri';
		if (estimatedMinutes >= 60) {
			const hours = Math.round(estimatedMinutes / 60);
			return `${hours} Jam Belajar`;
		}
		return `${estimatedMinutes} Menit`;
	}

	const totalEstimatedMinutes = $derived(
		detail.modules ? detail.modules.reduce((acc, m) => acc + (m.estimated_minutes || 0), 0) : 0
	);

	const totalDurationLabel = $derived(
		totalEstimatedMinutes > 0
			? `${Math.round(totalEstimatedMinutes / 60)} Jam Belajar`
			: '12 Jam Belajar'
	);

	const INITIAL_MODULE_LIMIT = 4;
	let showAllModules = $state(false);
	const visibleModules = $derived(
		showAllModules ? (detail.modules ?? []) : (detail.modules ?? []).slice(0, INITIAL_MODULE_LIMIT)
	);
	const hasMoreModules = $derived((detail.modules?.length ?? 0) > INITIAL_MODULE_LIMIT);

	let openModuleIds = $state<string[]>([]);
	let isInitialAccordionSet = false;
	$effect(() => {
		if (!isInitialAccordionSet && detail.modules && detail.modules.length > 0) {
			isInitialAccordionSet = true;
		}
	});

	function formatLessonTitle(moduleIndex: number, lessonIndex: number, title: string): string {
		const trimmed = title.trim();
		if (/^\d+(\.\d+)*\s+/.test(trimmed)) {
			return trimmed;
		}
		return `${moduleIndex}.${lessonIndex} ${trimmed}`;
	}
</script>

<!-- Kurikulum Terstruktur Header Card -->
<section
	class="relative overflow-hidden rounded-3xl border border-outline-variant/30 bg-white p-6 shadow-md sm:p-8"
>
	<div class="flex flex-col justify-between gap-6 md:flex-row md:items-center">
		<div class="space-y-4">
			<div
				class="flex items-center gap-2 font-label-md text-xs font-semibold tracking-wider text-on-surface-variant uppercase"
			>
				<BookOpen class="size-4 text-primary" />
				Kurikulum Terstruktur
			</div>
			<h2
				class="w-full font-headline-lg text-xl font-extrabold tracking-tight text-on-surface sm:text-2xl lg:text-3xl"
			>
				Apa Saja yang Akan Anda Pelajari?
			</h2>
			<div
				class="mt-2 inline-flex items-center rounded-full border border-outline-variant/30 bg-surface-container px-4 py-2 font-label-sm text-xs font-semibold text-on-surface-variant shadow-2xs"
			>
				{detail.total_modules} Modul Utama • {detail.total_lessons} Pelajaran Mandiri • {totalDurationLabel}
			</div>
		</div>
	</div>
</section>

<!-- Modul Accordion List -->
<section class="space-y-4">
	{#if detail.modules && detail.modules.length > 0}
		<Accordion.Root type="multiple" bind:value={openModuleIds} class="space-y-4">
			{#each visibleModules as module, index (module.id)}
				{@const duration = formatDuration(module.estimated_minutes)}
				<Accordion.Item
					value={module.id}
					class="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-md transition-colors hover:border-outline-variant/50"
				>
					<Accordion.Trigger
						class="cursor-pointer px-5 py-4 text-left transition-colors hover:bg-surface-container-low/40 hover:no-underline sm:px-6 sm:py-5"
					>
						<div class="flex items-center gap-4">
							<div
								class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest font-bold text-on-surface shadow-2xs"
							>
								{String(index + 1)}
							</div>
							<div class="space-y-1">
								<span class="block font-headline-sm text-base font-bold text-on-surface sm:text-lg">
									{module.title}
								</span>
								<div
									class="flex flex-wrap items-center gap-2 text-xs font-medium text-on-surface-variant"
								>
									<span class="inline-flex items-center gap-1">
										<BookOpen class="size-3.5 text-primary" />
										{module.lesson_count} Pelajaran
									</span>
									<span>•</span>
									<span class="inline-flex items-center gap-1">
										<Clock class="size-3.5 text-primary" />
										{duration}
									</span>
								</div>
							</div>
						</div>
					</Accordion.Trigger>

					<Accordion.Content class="px-5 pt-0 pb-5 sm:px-6 sm:pb-6">
						{#if module.description}
							<div class="py-3">
								<div
									class="rounded-xl bg-surface-container-low p-4 font-body-md text-sm leading-relaxed text-on-surface-variant"
								>
									{module.description}
								</div>
							</div>
						{/if}

						{#if module.lessons && module.lessons.length > 0}
							<div class="space-y-2.5">
								{#each module.lessons as lesson, lessonIdx (lesson.id)}
									{@const lessonTitle = formatLessonTitle(index + 1, lessonIdx + 1, lesson.title)}
									<div
										class="flex items-center justify-between rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-4 py-3.5 shadow-2xs"
									>
										<span class="font-body-md text-sm font-semibold text-on-surface">
											{lessonTitle}
										</span>
									</div>
								{/each}
							</div>
						{:else}
							<div
								class="rounded-xl border border-dashed border-outline-variant/40 p-4 text-center text-xs text-on-surface-variant"
							>
								Belum ada pelajaran yang dipublikasikan di modul ini.
							</div>
						{/if}
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>

		{#if hasMoreModules && !showAllModules}
			<button
				type="button"
				class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest py-3.5 font-label-md text-sm font-semibold text-on-surface shadow-xs transition-colors hover:bg-surface-container"
				onclick={() => (showAllModules = true)}
			>
				<span>
					Muat Lebih Banyak Modul ({detail.modules.length - INITIAL_MODULE_LIMIT} lainnya)
				</span>
				<ChevronDown class="size-4 text-on-surface-variant" />
			</button>
		{/if}
	{:else}
		<div
			class="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant shadow-xs"
		>
			Belum ada modul yang diterbitkan untuk level ini.
		</div>
	{/if}
</section>
