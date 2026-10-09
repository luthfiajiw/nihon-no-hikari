<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import type { QuestionSet } from '$features/question/domain/entities/question.entity';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { ArrowLeftIcon, CircleQuestionMarkIcon, TargetIcon } from 'lucide-svelte';

	interface Props {
		title: QuestionSet['title'];
		questionCount: QuestionSet['question_count'];
		passingScore: QuestionSet['passing_score'];
		backHref: string;
	}

	let { title, questionCount, passingScore, backHref }: Props = $props();
</script>

<header
	class="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 sm:px-6"
>
	<div class="flex min-w-0 items-center gap-2 sm:gap-3">
		<a
			href={resolve(backHref as Pathname)}
			class="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
			aria-label="Kembali ke materi"
		>
			<ArrowLeftIcon class="size-5" />
		</a>
		<h1 class="truncate text-sm font-bold sm:text-base">{title}</h1>
	</div>

	<div
		class="flex shrink-0 items-center gap-2 text-xs font-semibold text-sky-950 sm:gap-2 sm:text-sm"
	>
		<span class="inline-flex items-center gap-2 rounded-lg px-2.5 py-2 sm:px-3">
			<CircleQuestionMarkIcon class="size-4 text-sky-500" />
			<span>{questionCount}<span class="hidden sm:inline ml-1"> Soal</span></span>
		</span>
		<Separator orientation="vertical" class="data-[orientation=vertical]:h-5"/>
		<span class="inline-flex items-center gap-2 rounded-lg px-2.5 py-2 sm:px-3">
			<TargetIcon class="size-4 text-sky-500" />
			<span><span class="hidden sm:inline mr-1">Nilai Lulus </span>{passingScore}</span>
		</span>
	</div>
</header>
