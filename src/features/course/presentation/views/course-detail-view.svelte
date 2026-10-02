<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { ArcChart } from 'layerchart';
	import {
		ArrowLeftIcon,
		ArrowRightIcon,
		BookOpenIcon,
		CheckCircle2Icon,
		ChevronRightIcon,
		ClockIcon,
		LockIcon,
		PlayCircleIcon,
		SparklesIcon,
		TrendingUpIcon,
		UserIcon
	} from 'lucide-svelte';
	import type { CourseDetail, Module } from '../../domain/entities/course.entity';

	interface Props {
		course: CourseDetail | null;
		errorMessage?: string | null;
	}

	let { course, errorMessage = null }: Props = $props();

	const modules = $derived(course?.modules ?? []);
	const completedCount = $derived(
		modules.filter((courseModule) => courseModule.status === 'completed').length
	);
	const progressPercentage = $derived(
		modules.length === 0 ? 0 : Math.round((completedCount / modules.length) * 100)
	);
	const nextModule = $derived(
		modules.find((courseModule) => courseModule.status === 'in_progress') ??
			modules.find((courseModule) => courseModule.status === 'unlocked' && courseModule.is_entry) ??
			modules.find((courseModule) => courseModule.status === 'unlocked') ??
			null
	);
	const arcChartData = $derived([{ key: 'completed', value: progressPercentage }]);

	let activeModuleId = $state<string | null>(null);
	const activeModule = $derived(
		modules.find((courseModule) => courseModule.id === activeModuleId) ?? nextModule
	);

	function formatDuration(totalMinutes: number): string {
		if (totalMinutes < 60) return `${totalMinutes} menit`;

		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		return minutes > 0 ? `${hours} jam ${minutes} menit` : `${hours} jam`;
	}

	function statusLabel(courseModule: Module): string {
		switch (courseModule.status) {
			case 'completed':
				return 'Selesai';
			case 'in_progress':
				return 'Sedang dipelajari';
			case 'locked':
				return 'Terkunci';
			default:
				return 'Belum dimulai';
		}
	}

	function openLessons(): void {
		if (!course || !activeModule || activeModule.status === 'locked') return;
		goto(resolve(`/courses/${course.id}/lessons`));
	}
</script>

<div class="space-y-4 p-6">
	<div class="flex items-center gap-4">
		<Button variant="outline" size="icon" type="button" onclick={() => window.history.back()}>
			<ArrowLeftIcon />
		</Button>
		<p class="text-base font-semibold">Detail Kursus</p>
	</div>

	{#if errorMessage || !course}
		<Card.Root>
			<Card.Content class="py-10 text-center">
				<p class="font-semibold text-slate-900 dark:text-slate-100">Detail kursus tidak tersedia</p>
				<p class="mt-1 text-sm text-red-600 dark:text-red-400">
					{errorMessage ?? 'Data kursus tidak ditemukan.'}
				</p>
				<Button class="mt-5" type="button" onclick={() => goto(resolve('/courses'))}>
					Kembali ke daftar kursus
				</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
			<div class="flex lg:col-span-9">
				<Card.Root
					class="flex w-full flex-col justify-between border-sky-100 bg-linear-to-r from-sky-50/90 via-blue-50/50 to-indigo-50/60 py-6 shadow-xs dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800/80"
				>
					<Card.Content class="flex flex-1 flex-col justify-between">
						<div class="max-w-2xl space-y-3">
							<div class="flex flex-col items-start gap-2">
								<Badge
									class="rounded-lg border-none bg-emerald-500 px-3 py-1 text-xs font-extrabold text-white shadow-xs shadow-emerald-500/30 hover:bg-emerald-600"
								>
									{course.level.code}
								</Badge>
								<h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
									{course.title}
								</h1>
							</div>

							<p class="text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
								{course.description}
							</p>

							<div class="flex flex-wrap items-center gap-3 pt-2">
								<div
									class="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
								>
									<BookOpenIcon class="size-4 text-sky-500" />
									<span>{course.total_lessons} Materi</span>
								</div>
								<div
									class="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
								>
									<ClockIcon class="size-4 text-sky-500" />
									<span>{formatDuration(course.total_minutes)}</span>
								</div>
								<div
									class="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
								>
									<UserIcon class="size-4 text-sky-500" />
									<span>{course.level.name}</span>
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<div class="flex lg:col-span-3">
				<Card.Root class="flex w-full flex-col justify-between">
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
									{completedCount} / {modules.length} Modul
								</p>
								<p class="text-sm text-slate-400 dark:text-slate-500">
									Level {course.level.code} - {course.title}
								</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<div class="flex lg:col-span-9">
				<div class="flex w-full flex-col gap-4">
					<Card.Root class="flex h-full w-full flex-col justify-between">
						<Card.Header class="border-b border-slate-100 dark:border-slate-800">
							<Card.Title class="text-base font-bold text-slate-900 dark:text-slate-100">
								Daftar Modul
							</Card.Title>
						</Card.Header>

						<Card.Content class="flex-1 divide-y divide-slate-100 p-0 dark:divide-slate-800">
							{#if modules.length === 0}
								<p class="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
									Belum ada modul pada kursus ini.
								</p>
							{:else}
								{#each modules as courseModule, index (courseModule.id)}
									<button
										type="button"
										disabled={courseModule.status === 'locked'}
										onclick={() => (activeModuleId = courseModule.id)}
										class={`flex w-full items-center justify-between p-4 text-left transition-colors sm:px-6 ${
											activeModule?.id === courseModule.id
												? 'bg-sky-50/50 dark:bg-sky-950/20'
												: 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
										} disabled:cursor-not-allowed disabled:opacity-60`}
									>
										<div class="flex min-w-0 items-start gap-4">
											<span
												class={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${activeModule?.id === courseModule.id ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
											>
												{index + 1}
											</span>
											<div class="min-w-0 space-y-1">
												<h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
													{courseModule.title}
												</h3>
												<p class="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
													{courseModule.description}
												</p>
											</div>
										</div>

										<div class="ml-4 flex shrink-0 items-center gap-4">
											<Badge
												variant={courseModule.status === 'completed' ? 'default' : 'outline'}
												class={courseModule.status === 'completed'
													? 'hidden border-none bg-emerald-50 font-semibold text-emerald-600 hover:bg-emerald-100 sm:flex dark:bg-emerald-950/50 dark:text-emerald-400'
													: 'hidden font-medium text-slate-500 sm:inline-flex dark:text-slate-400'}
											>
												{#if courseModule.status === 'completed'}
													<CheckCircle2Icon class="mr-1 size-3" />
												{:else if courseModule.status === 'locked'}
													<LockIcon class="mr-1 size-3" />
												{:else if courseModule.status === 'in_progress'}
													<PlayCircleIcon class="mr-1 size-3" />
												{/if}
												{statusLabel(courseModule)}
											</Badge>
											<span class="text-xs font-medium text-slate-400"
												>{formatDuration(courseModule.estimated_minutes)}</span
											>
											<ChevronRightIcon class="size-4 text-slate-400" />
										</div>
									</button>
								{/each}
							{/if}
						</Card.Content>
					</Card.Root>

					<Card.Root
						class="border-sky-100 bg-gradient-to-r from-sky-50/80 via-blue-50/40 to-indigo-50/60 pt-4 pb-6 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800/60"
					>
						<Card.Content class="flex flex-col items-center justify-between gap-4 sm:flex-row">
							<div class="flex items-center gap-3">
								<div
									class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-2xs dark:bg-slate-800 dark:text-sky-400"
								>
									<SparklesIcon class="size-5" />
								</div>
								<div>
									<h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">
										Ingat, konsistensi adalah kunci!
									</h4>
									<p class="text-xs text-slate-500 dark:text-slate-400">
										Sedikit demi sedikit, kemampuan bahasa Jepang kamu akan terus berkembang.
									</p>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			</div>

			<div class="lg:col-span-3">
				<Card.Root class="flex w-full flex-col justify-between">
					<Card.Content class="flex h-full flex-col justify-between">
						{#if activeModule}
							<div class="space-y-4">
								<Badge
									variant="secondary"
									class="border-none bg-sky-100 font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
								>
									{activeModule.status === 'in_progress' ? 'Lanjutkan' : 'Berikutnya'}
								</Badge>
								<div>
									<Card.Title class="text-xl font-bold text-slate-900 dark:text-slate-100"
										>{activeModule.title}</Card.Title
									>
									<Card.Description
										class="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400"
										>{activeModule.description}</Card.Description
									>
								</div>
							</div>
							<div class="flex items-center justify-between pt-4">
								<div class="flex items-center gap-1">
									<ClockIcon class="size-3 text-slate-500" />
									<span class="text-xs font-medium text-slate-400"
										>{formatDuration(activeModule.estimated_minutes)}</span
									>
								</div>
								<Button
									type="button"
									onclick={openLessons}
									class="rounded-xl bg-sky-600 font-medium text-white shadow-xs hover:bg-sky-700"
								>
									{activeModule.status === 'in_progress' ? 'Lanjut Belajar' : 'Mulai Belajar'}
									<ArrowRightIcon class="ml-1.5 size-4" />
								</Button>
							</div>
						{:else}
							<p class="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
								Belum ada modul yang dapat dipelajari.
							</p>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{/if}
</div>
