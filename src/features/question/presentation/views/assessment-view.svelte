<script lang="ts">
	import type {
		Question,
		QuestionSetDetail,
		QuestionSkill
	} from '$features/question/domain/entities/question.entity';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils.js';
	import {
		ArrowLeftIcon,
		ArrowRightIcon,
		CheckIcon,
		CircleAlertIcon,
		CircleCheckIcon,
		Grid2X2Icon,
		RotateCcwIcon,
		TrophyIcon
	} from 'lucide-svelte';

	interface Props {
		questionSet: QuestionSetDetail | null;
		backHref: string;
		errorMessage?: string | null;
	}
	let { questionSet, backHref, errorMessage = null }: Props = $props();
	let activeIndex = $state(0);
	let answers = $state<Record<string, string>>({});
	let isComplete = $state(false);

	const skillLabels: Record<QuestionSkill, string> = {
		reading: 'Reading',
		writing: 'Writing',
		listening: 'Listening',
		speaking: 'Speaking'
	};
	const questions = $derived(
		[...(questionSet?.questions ?? [])].sort((a, b) => a.order_index - b.order_index)
	);
	const activeQuestion = $derived(questions[activeIndex]);
	const assessmentLabel = $derived(questionSet?.kind === 'final_exam' ? 'Tes' : 'Latihan');
	const answeredCount = $derived(
		questions.filter((question) => Boolean(answers[question.id]?.trim())).length
	);

	function optionsFor(question: Question) {
		return [...(question.options ?? [])].sort((a, b) => a.order_index - b.order_index);
	}
	function setAnswer(value: string): void {
		if (!isComplete && activeQuestion) answers[activeQuestion.id] = value;
	}
	function goToQuestion(index: number): void {
		if (index < 0 || index >= questions.length) return;
		isComplete = false;
		activeIndex = index;
	}
	function goNext(): void {
		if (activeIndex < questions.length - 1) activeIndex += 1;
		else isComplete = true;
	}
	function restart(): void {
		answers = {};
		activeIndex = 0;
		isComplete = false;
	}
</script>

<svelte:head>
	<title>{questionSet?.title || 'Assessment'} - Nihon no Hikari</title>
</svelte:head>

<main class="mx-auto flex h-full max-w-screen-xl flex-col overflow-hidden px-4 py-5">
	{#if errorMessage || !questionSet}
		<Card.Root class="mx-auto mt-12 w-full max-w-xl rounded-2xl border-red-100">
			<Card.Content class="flex flex-col items-center py-12 text-center">
				<CircleAlertIcon class="size-12 text-red-500" />
				<h1 class="mt-4 text-xl font-extrabold text-slate-900">Set soal tidak dapat dimuat</h1>
				<p class="mt-2 text-sm text-red-600">{errorMessage || 'Detail set soal tidak tersedia.'}</p>
				<Button href={backHref} class="mt-6 bg-sky-600 text-white">
					<ArrowLeftIcon class="size-4" /> Kembali ke materi
				</Button>
			</Card.Content>
		</Card.Root>
	{:else if questions.length === 0}
		<Card.Root class="mx-auto mt-12 w-full max-w-xl rounded-2xl">
			<Card.Content class="py-12 text-center">
				<h1 class="text-xl font-extrabold text-slate-900">Belum ada soal</h1>
				<p class="mt-2 text-sm text-slate-500">Set soal ini belum memiliki pertanyaan.</p>
				<Button href={backHref} class="mt-6 bg-sky-600 text-white">Kembali ke materi</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<div
			class="grid min-h-0 flex-1 content-start items-start gap-5 xl:grid-cols-[minmax(0,1fr)_350px]"
		>
			<Card.Root
				class="min-h-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-6 shadow-sm"
			>
				{#if isComplete}
					<div class="flex flex-col items-center justify-center py-8 text-center">
						<TrophyIcon class="size-16 text-sky-600" />
						<p class="mt-5 text-sm font-bold tracking-widest text-sky-600 uppercase">
							{assessmentLabel} selesai
						</p>
						<h2 class="mt-2 text-3xl font-extrabold text-slate-900">Semua soal telah dijawab</h2>
						<p class="mt-2 text-sm text-slate-500">
							Kamu telah menjawab {answeredCount} dari {questions.length} soal.
						</p>
						<div class="mt-6 flex gap-3">
							<Button type="button" onclick={restart}
								><RotateCcwIcon class="size-4" /> Ulangi</Button
							>
							<Button href={backHref} class="bg-sky-600 text-white">Kembali ke materi</Button>
						</div>
					</div>
				{:else if activeQuestion}
					<div class="flex items-center gap-3">
						<Badge class="bg-sky-50 text-sky-700">{skillLabels[activeQuestion.skill]}</Badge>
						<span class="text-sm text-slate-500"
							>Soal {activeIndex + 1} dari {questions.length}</span
						>
					</div>
					<h2 class="mt-5 text-xl font-extrabold text-slate-900 sm:text-2xl">
						{activeQuestion.prompt_text}
					</h2>
					{#if activeQuestion.stimulus_media_url}
						<img
							src={activeQuestion.stimulus_media_url}
							alt={activeQuestion.stimulus_text || activeQuestion.prompt_text}
							class="mx-auto my-5 max-h-64 max-w-full rounded-xl object-contain"
						/>
					{/if}
					{#if activeQuestion.stimulus_text}
						<div
							class="mx-auto my-4 flex min-h-28 items-center justify-center rounded-xl bg-slate-50 px-6 py-4 text-center text-5xl sm:text-7xl"
						>
							{activeQuestion.stimulus_text}
						</div>
					{/if}
					{#if activeQuestion.question_type === 'multiple_choice' && optionsFor(activeQuestion).length}
						<div class="grid gap-3 sm:grid-cols-2">
							{#each optionsFor(activeQuestion) as option (option.id)}
								{@const selected = answers[activeQuestion.id] === option.id}
								<Button
									type="button"
									variant="outline"
									onclick={() => setAnswer(option.id)}
									aria-pressed={selected}
									class={cn(
										'min-h-14 w-full justify-start gap-4 rounded-xl px-4 text-left whitespace-normal',
										selected
											? 'border-sky-600 bg-sky-600 text-white hover:bg-sky-700 hover:text-white'
											: 'border-slate-300 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700'
									)}
								>
									<span
										class={cn(
											'flex size-4 shrink-0 items-center justify-center rounded-full border-2',
											selected ? 'border-white' : 'border-slate-400'
										)}
									>
										{#if selected}<span class="size-2 rounded-full bg-white"></span>{/if}
									</span>
									{#if option.media_url}
										<img
											src={option.media_url}
											alt={option.label}
											class="size-12 rounded-lg object-contain"
										/>
									{/if}
									<span>{option.label}</span>
								</Button>
							{/each}
						</div>
					{:else}
						<label class="mt-6 block text-sm font-bold" for="written-answer">Jawaban</label>
						<Input
							id="written-answer"
							value={answers[activeQuestion.id] || ''}
							oninput={(event) => setAnswer(event.currentTarget.value)}
							placeholder="Tulis jawaban di sini"
							class="mt-2 h-12 rounded-xl"
						/>
					{/if}
				{/if}
			</Card.Root>
			<div class="flex min-h-0 flex-col justify-between gap-5 self-stretch">
				<Card.Root
					class="min-h-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-5 shadow-sm"
				>
					<div class="flex items-center gap-3 text-slate-900">
						<Grid2X2Icon class="size-6 text-sky-600" />
						<h2 class="text-lg font-bold">Soal</h2>
					</div>
					<div class="mt-2 grid grid-cols-5 gap-2.5">
						{#each questions as question, index (question.id)}
							{@const answered = Boolean(answers[question.id]?.trim())}
							<Button
								type="button"
								variant="outline"
								onclick={() => goToQuestion(index)}
								aria-label={`Buka soal ${index + 1}`}
								aria-current={activeIndex === index && !isComplete ? 'step' : undefined}
								class={cn(
									'relative aspect-square h-auto w-full rounded-xl p-0 font-bold',
									activeIndex === index && !isComplete
										? 'border-sky-600 bg-sky-600 text-white shadow-sm hover:bg-sky-700 hover:text-white'
										: answered
											? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800'
											: 'border-slate-200 bg-white text-slate-500 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700'
								)}
							>
								{index + 1}
								{#if answered}
									<CircleCheckIcon
										class={cn(
											'absolute top-1 right-1 size-3',
											activeIndex === index && !isComplete ? 'text-white' : 'text-emerald-500'
										)}
									/>
								{/if}
							</Button>
						{/each}
					</div>
				</Card.Root>
				{#if !isComplete && activeQuestion}
					<footer class={`flex shrink-0 items-center gap-4 ${activeIndex === 0 ? 'justify-end' : 'justify-between'}`}>
						<Button
							type="button"
							onclick={() => goToQuestion(activeIndex - 1)}
							disabled={activeIndex === 0}
							class={activeIndex === 0 ? 'hidden' : ''}
						>
							<ArrowLeftIcon class="size-4" />
						</Button>
						<Button
							type="button"
							onclick={goNext}
						>
							{activeIndex === questions.length - 1 ? 'Selesai' : ''}
							{#if activeIndex === questions.length - 1}
								<CheckIcon class="size-4" />
							{:else}
								<ArrowRightIcon class="size-4" />
							{/if}
						</Button>
					</footer>
				{/if}
			</div>
		</div>
	{/if}
</main>
