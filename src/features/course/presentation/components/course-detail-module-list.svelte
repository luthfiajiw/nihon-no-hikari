<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { cn } from '$lib/utils.js';
	import { CheckCircle2Icon, ChevronRightIcon, LockIcon, PlayCircleIcon } from 'lucide-svelte';
	import type { Module } from '../../domain/entities/course.entity';
	import { formatDuration, getModuleStatusLabel } from '../utils/course-format';

	interface Props {
		modules: Module[];
		activeModuleId: string | null;
		class?: string;
	}

	let { modules, activeModuleId, class: className = '' }: Props = $props();
</script>

<Card.Root class={`flex h-full w-full flex-col justify-between ${className}`}>
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
					class={`flex w-full items-center justify-between p-4 text-left transition-colors sm:px-6 ${
						activeModuleId == courseModule.id
							? 'bg-sky-50/50 dark:bg-sky-950/20'
							: 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
					} disabled:cursor-not-allowed disabled:opacity-60`}
				>
					<div class="flex min-w-0 items-start gap-4">
						<span
							class={`flex size-5 shrink-0 items-center justify-center rounded-full pr-px pb-px text-xs font-bold ${activeModuleId === courseModule.id ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
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
							class={cn('hidden', {
								'border-none bg-emerald-50 font-semibold text-emerald-600 hover:bg-emerald-100 sm:flex dark:bg-emerald-950/50 dark:text-emerald-400':
									courseModule.status === 'completed',
								'border-sky-200 bg-sky-50 font-medium text-sky-600 sm:inline-flex dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-400':
									courseModule.status === 'in_progress',
								'font-medium text-slate-500 sm:inline-flex dark:text-slate-400':
									courseModule.status === 'locked'
							})}
						>
							{#if courseModule.status === 'completed'}
								<CheckCircle2Icon class="mr-1 size-3" />
							{:else if courseModule.status === 'locked'}
								<LockIcon class="mr-1 size-3" />
							{:else if courseModule.status === 'in_progress'}
								<PlayCircleIcon class="mr-1 size-3" />
							{/if}
							{getModuleStatusLabel(courseModule.status)}
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
