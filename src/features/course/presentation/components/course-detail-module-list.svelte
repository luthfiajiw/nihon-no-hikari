<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { cn } from '$lib/utils.js';
	import {
		CheckCircle2Icon,
		ChevronRightIcon,
		CircleDotIcon,
		ClockIcon,
		LockIcon,
		PlayCircleIcon
	} from 'lucide-svelte';
	import type { Module } from '../../domain/entities/course.entity';
	import { formatDuration, getModuleStatusLabel } from '$lib/course-format';

	interface Props {
		modules: Module[];
		activeModuleId: string | null;
		class?: string;
	}

	let { modules, activeModuleId, class: className = '' }: Props = $props();
</script>

<Card.Root class={`flex h-full w-full flex-col justify-between ${className}`}>
	<Card.Header class="border-b">
		<Card.Title>Daftar Modul</Card.Title>
	</Card.Header>

	<Card.Content class="@container flex flex-1 flex-col gap-2.5">
		{#if modules.length === 0}
			<p class="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
				Belum ada modul pada kursus ini.
			</p>
		{:else}
			{#each modules as courseModule, index (courseModule.id)}
				{@const isActive = activeModuleId === courseModule.id}
				<button
					type="button"
					disabled={courseModule.status === 'locked'}
					aria-current={isActive ? 'step' : undefined}
					class={cn(
						'grid w-full grid-cols-[2rem_minmax(0,1fr)_1.25rem] items-center gap-x-3 gap-y-2 rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed @2xl:grid-cols-[2rem_minmax(0,1fr)_auto_1.25rem] @2xl:gap-x-6 @2xl:px-6',
						isActive
							? 'border-sky-500 bg-sky-50/80 shadow-sm shadow-sky-500/15 dark:border-sky-500 dark:bg-sky-950/30'
							: 'border-slate-200/70 bg-slate-50/40 enabled:hover:border-slate-300 enabled:hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 dark:enabled:hover:border-slate-700 dark:enabled:hover:bg-slate-800/50'
					)}
				>
					<span
						class={cn(
							'flex size-8 items-center justify-center rounded-full text-base font-bold',
							isActive
								? 'bg-sky-600 text-white shadow-xs'
								: 'bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
						)}
					>
						{index + 1}
					</span>
					<div class="min-w-0 space-y-0.5">
						<h3 class="text-base leading-5 font-bold text-slate-950 dark:text-slate-100">
							{courseModule.title}
						</h3>
						<p
							class="line-clamp-2 text-sm leading-5 text-slate-500 @2xl:line-clamp-1 dark:text-slate-400"
						>
							{courseModule.description}
						</p>
					</div>

					<div
						class="col-span-2 col-start-2 row-start-2 flex flex-wrap items-center gap-3 @2xl:col-span-1 @2xl:col-start-3 @2xl:row-start-1 @2xl:flex-nowrap @2xl:gap-5"
					>
						<Badge
							variant="outline"
							class={cn('h-8 gap-2 px-3 font-medium [&>svg]:size-3.5!', {
								'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400':
									courseModule.status === 'completed',
								'border-sky-300 bg-sky-50 text-sky-600 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-400':
									courseModule.status === 'in_progress',
								'border-slate-200/70 text-slate-500 dark:border-slate-700 dark:text-slate-400':
									courseModule.status === 'locked' || courseModule.status === 'unlocked'
							})}
						>
							{#if courseModule.status === 'completed'}
								<CheckCircle2Icon aria-hidden="true" />
							{:else if courseModule.status === 'locked'}
								<LockIcon aria-hidden="true" />
							{:else if courseModule.status === 'in_progress'}
								<CircleDotIcon aria-hidden="true" />
							{:else}
								<PlayCircleIcon aria-hidden="true" />
							{/if}
							{getModuleStatusLabel(courseModule.status)}
						</Badge>
						<span
							class="flex items-center gap-2 text-sm whitespace-nowrap text-slate-500 dark:text-slate-400"
						>
							<ClockIcon class="size-4 shrink-0" aria-hidden="true" />
							{formatDuration(courseModule.estimated_minutes)}
						</span>
					</div>
					<ChevronRightIcon
						class={cn(
							'col-start-3 row-start-1 size-5 @2xl:col-start-4',
							isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'
						)}
						aria-hidden="true"
					/>
				</button>
			{/each}
		{/if}
	</Card.Content>
</Card.Root>
