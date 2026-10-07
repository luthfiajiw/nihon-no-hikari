<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { ArrowRightIcon, ClockIcon } from 'lucide-svelte';
	import type { Module } from '../../domain/entities/course.entity';
	import { formatDuration } from '../utils/course-format';

	interface Props {
		activeModule: Module | null;
		onOpenLessons: () => void;
		isOpeningLessons?: boolean;
		class?: string;
	}

	let {
		activeModule,
		onOpenLessons,
		isOpeningLessons = false,
		class: className = ''
	}: Props = $props();
</script>

<Card.Root class={`flex w-full flex-col justify-between ${className}`}>
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
					onclick={onOpenLessons}
					disabled={isOpeningLessons}
					isLoading={isOpeningLessons}
					class="rounded-xl bg-sky-600 font-medium text-white shadow-xs hover:bg-sky-700"
				>
					{isOpeningLessons
						? 'Membuka...'
						: activeModule.status === 'in_progress'
							? 'Lanjut Belajar'
							: 'Mulai Belajar'}
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
