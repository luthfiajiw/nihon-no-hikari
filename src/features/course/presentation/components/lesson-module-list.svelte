<script lang="ts">
	import { CheckCircle2Icon, CircleIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import type { Status } from '../../domain/entities/course.entity';

	interface Lesson {
		id: string;
		title: string;
		order: string;
		status?: Status;
		isFree?: boolean;
	}

	interface Module {
		id: string;
		title: string;
		order: string;
		completedCount: string;
		lessons: Lesson[];
	}

	interface Props {
		modules?: Module[];
		activeLessonId?: string;
		onLessonSelect?: (lessonId: string) => void;
	}

	let { modules = [], activeLessonId = '', onLessonSelect }: Props = $props();

	// Track which modules are collapsed
	let collapsedModules = $state<Set<string>>(new Set());

	function toggleModule(moduleId: string) {
		const next = new SvelteSet(collapsedModules);
		if (next.has(moduleId)) {
			next.delete(moduleId);
		} else {
			next.add(moduleId);
		}
		collapsedModules = next;
	}
</script>

<div class="min-h-0 flex-1 overflow-y-auto">
	{#each modules as mod (mod.id)}
		{@const isExpanded = !collapsedModules.has(mod.id)}

		<div class={`border-b border-border ${isExpanded ? 'last:border-b-0' : ''} `}>
			<!-- Module Header -->
			<button
				type="button"
				class="flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-4 py-3 text-left transition-colors hover:bg-accent"
				onclick={() => toggleModule(mod.id)}
			>
				<div class="flex flex-col gap-0.5">
					<span class="text-sm font-bold tracking-wider text-muted-foreground uppercase"
						>{mod.title}</span
					>
					<span class="text-xs text-muted-foreground/70">{mod.completedCount}</span>
				</div>
				{#if isExpanded}
					<ChevronDownIcon class="size-4 shrink-0 text-slate-400" />
				{:else}
					<ChevronRightIcon class="size-4 shrink-0 text-slate-400" />
				{/if}
			</button>

			<!-- Lessons within this module -->
			{#if isExpanded}
				<div class="flex flex-col">
					{#each mod.lessons as lesson (lesson.id)}
						{@const isActive = activeLessonId === lesson.id}
						{@const isLocked = lesson.status === 'locked'}
						<button
							type="button"
							disabled={isLocked}
							class="flex w-full items-start gap-2.5 border-none bg-transparent py-2.5 text-left transition-colors {isLocked
								? 'cursor-not-allowed opacity-50'
								: 'cursor-pointer hover:bg-accent'} {isActive
								? 'border-l-[3px] border-sky-600 bg-gradient-to-r from-sky-100/70 to-sky-50/40 pr-4 pl-[17px] dark:border-sky-400 dark:from-sky-950/40 dark:to-sky-950/10'
								: 'px-4'}"
							onclick={() => !isLocked && onLessonSelect?.(lesson.id)}
						>
							<span class="mt-0.5 flex shrink-0 items-center justify-center">
								{#if lesson.status === 'completed'}
									<CheckCircle2Icon class="size-4 text-emerald-500" />
								{:else if lesson.status === 'in_progress'}
									<CircleIcon class="size-4 text-sky-500" />
								{:else}
									<CircleIcon class="size-4 text-slate-300 dark:text-slate-600" />
								{/if}
							</span>

							<div class="flex min-w-0 flex-col gap-0.5">
								<span
									class="text-sm leading-snug {isActive
										? 'font-semibold text-sky-700 dark:text-sky-400'
										: 'font-normal text-foreground'}">{lesson.title}</span
								>
								<span class="flex items-center gap-1.5 text-xs text-muted-foreground">
									{lesson.order}
									{#if lesson.isFree}
										<span
											class="rounded bg-sky-100 px-1.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-400"
											>Gratis</span
										>
									{/if}
								</span>
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>
