<script lang="ts">
	import {
		CheckCircle2Icon,
		CircleIcon,
		ChevronDownIcon,
		ChevronRightIcon
	} from "lucide-svelte";
	import { SvelteSet } from "svelte/reactivity";

	interface Lesson {
		id: string;
		title: string;
		order: string;
		status: "completed" | "in_progress" | "not_started";
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

	let {
		modules = [],
		activeLessonId = "",
		onLessonSelect
	}: Props = $props();

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

<div class="flex-1 min-h-0 overflow-y-auto">
	{#each modules as mod (mod.id)}
		{@const isExpanded = !collapsedModules.has(mod.id)}

		<div class={`border-b border-border ${isExpanded ? 'last:border-b-0' : ''} `}>
			<!-- Module Header -->
			<button
				type="button"
				class="flex items-center justify-between w-full px-4 py-3 bg-transparent hover:bg-accent transition-colors cursor-pointer text-left border-none"
				onclick={() => toggleModule(mod.id)}
			>
				<div class="flex flex-col gap-0.5">
					<span class="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">{mod.title}</span>
					<span class="text-[10px] text-muted-foreground/70">{mod.completedCount}</span>
				</div>
				{#if isExpanded}
					<ChevronDownIcon class="size-3.5 shrink-0 text-slate-400" />
				{:else}
					<ChevronRightIcon class="size-3.5 shrink-0 text-slate-400" />
				{/if}
			</button>

			<!-- Lessons within this module -->
			{#if isExpanded}
				<div class="flex flex-col">
					{#each mod.lessons as lesson (lesson.id)}
						{@const isActive = activeLessonId === lesson.id}
						<button
							type="button"
							class="flex items-start gap-2.5 w-full py-2.5 bg-transparent hover:bg-accent transition-colors cursor-pointer text-left border-none {isActive
								? 'bg-gradient-to-r from-sky-100/70 to-sky-50/40 dark:from-sky-950/40 dark:to-sky-950/10 border-l-[3px] border-sky-600 dark:border-sky-400 pl-[17px] pr-4'
								: 'px-4'}"
							onclick={() => onLessonSelect?.(lesson.id)}
						>
							<span class="flex items-center justify-center shrink-0 mt-0.5">
								{#if lesson.status === "completed"}
									<CheckCircle2Icon class="size-4 text-emerald-500" />
								{:else if lesson.status === "in_progress"}
									<CircleIcon class="size-4 text-sky-500" />
								{:else}
									<CircleIcon class="size-4 text-slate-300 dark:text-slate-600" />
								{/if}
							</span>

							<div class="flex flex-col gap-0.5 min-w-0">
								<span class="text-xs leading-snug {isActive ? 'font-semibold text-sky-700 dark:text-sky-400' : 'font-normal text-foreground'}">{lesson.title}</span>
								<span class="text-[11px] text-muted-foreground flex items-center gap-1.5">
									{lesson.order}
									{#if lesson.isFree}
										<span class="text-[10px] font-semibold text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60 px-1.5 py-0.5 rounded">Gratis</span>
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
