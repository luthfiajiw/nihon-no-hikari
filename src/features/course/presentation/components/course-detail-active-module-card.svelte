<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { ArrowRightIcon, ClockIcon } from 'lucide-svelte';
	import type { Module } from '../../domain/entities/course.entity';
	import { formatDuration } from '$lib/course-format';

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
					class="border-none bg-taupe-100 font-semibold text-taupe-700 dark:bg-taupe-950/60 dark:text-taupe-300"
				>
					{activeModule.status === 'in_progress' ? 'Lanjutkan' : 'Berikutnya'}
				</Badge>
				<div>
					<Card.Title class="text-2xl">
						{activeModule.title}
					</Card.Title>
					<Card.Description class="mt-2">
						{activeModule.description}
					</Card.Description>
				</div>
			</div>
			<div class="flex flex-wrap items-center justify-between gap-4 pt-6 pb-1">
				<div class="flex items-center gap-2 text-muted-foreground">
					<ClockIcon class="size-4" />
					<span class="text-sm font-medium">
						{formatDuration(activeModule.estimated_minutes)}
					</span>
				</div>
				<Button
					type="button"
					onclick={onOpenLessons}
					disabled={isOpeningLessons}
					isLoading={isOpeningLessons}
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
			<p class="py-8 text-center text-sm text-taupe-500 dark:text-taupe-400">
				Belum ada modul yang dapat dipelajari.
			</p>
		{/if}
	</Card.Content>
</Card.Root>
