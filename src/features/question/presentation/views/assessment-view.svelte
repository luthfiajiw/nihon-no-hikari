<script lang="ts">
	import type {
		AttemptResult,
		Question,
		QuestionKind,
		QuestionSkill,
		SubmitAttemptRequest
	} from '$features/question/domain/entities/question.entity';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils.js';
	import {
		ArrowLeftIcon,
		ArrowRightIcon,
		CheckIcon,
		CircleAlertIcon,
		CircleCheckIcon,
		Grid2X2Icon,
		TrophyIcon
	} from 'lucide-svelte';
	import { getAssessmentContext } from '../contexts/assessment-context';
	import { submitQuestionSetAttempt } from '../remotes/submit-question-set-attempt.remote';

	interface Props {
		questionSetId: string;
		courseId: string | null;
		lessonId: string | null;
		expectedKind: QuestionKind;
		backHref: string;
		errorMessage?: string | null;
	}

	let {
		questionSetId,
		courseId,
		lessonId,
		expectedKind,
		backHref,
		errorMessage = null
	}: Props = $props();

	const assessment = getAssessmentContext();
	let activeIndex = $state(0);
	let answers = $state<Record<string, string>>({});
	let isSubmitDialogOpen = $state(false);
	let isSubmitting = $state(false);
	let submitError = $state<string | null>(null);
	let submitResult = $state<AttemptResult | null>(null);

	const skillLabels: Record<QuestionSkill, string> = {
		reading: 'Reading',
		writing: 'Writing',
		listening: 'Listening',
		speaking: 'Speaking'
	};
	const attempt = $derived(
		assessment.attemptResponse?.data.question_set.id === questionSetId &&
			assessment.attemptResponse.data.question_set.kind === expectedKind
			? assessment.attemptResponse.data
			: null
	);
	const questionSet = $derived(attempt?.question_set ?? null);
	const questions = $derived(
		[...(attempt?.questions ?? [])].sort((a, b) => a.order_index - b.order_index)
	);
	const activeQuestion = $derived(questions[activeIndex]);
	const assessmentLabel = $derived(questionSet?.kind === 'final_exam' ? 'Tes' : 'Latihan');
	const answeredCount = $derived(
		questions.filter((question) => Boolean(answers[question.id]?.trim())).length
	);
	const unansweredCount = $derived(questions.length - answeredCount);
	const correctAnswerCount = $derived(
		submitResult?.answers.filter((answer) => answer.is_correct).length ?? 0
	);

	function optionsFor(question: Question) {
		return [...(question.options ?? [])].sort((a, b) => a.order_index - b.order_index);
	}

	function setAnswer(value: string): void {
		if (!isSubmitting && !submitResult && activeQuestion) answers[activeQuestion.id] = value;
	}

	function goToQuestion(index: number): void {
		if (isSubmitting || submitResult || index < 0 || index >= questions.length) return;
		activeIndex = index;
	}

	function goNext(): void {
		if (isSubmitting || submitResult) return;
		if (activeIndex < questions.length - 1) {
			activeIndex += 1;
			return;
		}

		submitError = null;
		isSubmitDialogOpen = true;
	}

	function createSubmitRequest(): SubmitAttemptRequest {
		return {
			answers: questions.map((question) => {
				const answer = answers[question.id]?.trim() || null;

				return {
					question_id: question.id,
					selected_option_id: question.question_type === 'multiple_choice' ? answer : null,
					stroke_input: question.question_type === 'stroke_writing' ? answer : null
				};
			})
		};
	}

	async function handleSubmit(): Promise<void> {
		if (isSubmitting || submitResult) return;
		if (!courseId || !lessonId || !attempt) {
			submitError = 'Data pengerjaan tidak lengkap. Kembali ke materi dan mulai ulang.';
			return;
		}

		isSubmitting = true;
		submitError = null;

		try {
			const response = await submitQuestionSetAttempt({
				courseId,
				lessonId,
				questionSetId,
				attemptId: attempt.id,
				request: createSubmitRequest()
			});

			if (!response.success || !('data' in response)) {
				throw new Error(response.message);
			}

			submitResult = response.data;
			isSubmitDialogOpen = false;
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'Gagal mengirim jawaban.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>{questionSet?.title || 'Assessment'} - Nihon no Hikari</title>
</svelte:head>

<main class="mx-auto flex h-full max-w-screen-xl flex-col overflow-hidden px-4 py-5">
	{#if errorMessage || !attempt || !questionSet}
		<Card.Root class="mx-auto mt-12 w-full max-w-xl rounded-2xl border-red-100">
			<Card.Content class="flex flex-col items-center py-12 text-center">
				<CircleAlertIcon class="size-12 text-red-500" />
				<h1 class="mt-4 text-xl font-extrabold text-slate-900">Set soal tidak dapat dimuat</h1>
				<p class="mt-2 text-sm text-red-600">{errorMessage || 'Detail set soal tidak tersedia.'}</p>
				<Button href={backHref} disabled={isSubmitting} class="mt-6 bg-sky-600 text-white">
					Kembali ke materi
				</Button>
			</Card.Content>
		</Card.Root>
	{:else if questions.length === 0}
		<Card.Root class="mx-auto mt-12 w-full max-w-xl rounded-2xl">
			<Card.Content class="py-12 text-center">
				<h1 class="text-xl font-extrabold text-slate-900">Belum ada soal</h1>
				<p class="mt-2 text-sm text-slate-500">Set soal ini belum memiliki pertanyaan.</p>
				<Button href={backHref} disabled={isSubmitting} class="mt-6 bg-sky-600 text-white">
					Kembali ke materi
				</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<div
			class="grid min-h-0 flex-1 content-start items-start gap-5 xl:grid-cols-[minmax(0,1fr)_350px]"
		>
			<Card.Root
				class="min-h-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-6 shadow-sm"
			>
				{#if submitResult}
					<div class="flex flex-col items-center justify-center py-4 text-center">
						<div
							class={cn(
								'flex size-16 items-center justify-center rounded-full',
								submitResult.is_passed
									? 'bg-emerald-100 text-emerald-600'
									: 'bg-amber-100 text-amber-600'
							)}
						>
							{#if submitResult.is_passed}
								<TrophyIcon class="size-9" />
							{:else}
								<CircleAlertIcon class="size-9" />
							{/if}
						</div>
						<Badge
							class={cn(
								'mt-5',
								submitResult.is_passed
									? 'bg-emerald-100 text-emerald-700'
									: 'bg-amber-100 text-amber-700'
							)}
						>
							{submitResult.is_passed ? 'Lulus' : 'Belum lulus'}
						</Badge>
						<p class="mt-3 text-sm font-bold tracking-widest text-sky-600 uppercase">
							Hasil {assessmentLabel}
						</p>
						<h2 class="mt-1 text-4xl font-extrabold text-slate-900">
							Nilai {submitResult.score}
						</h2>
						<p class="mt-2 text-sm text-slate-500">
							{correctAnswerCount} dari {submitResult.answers.length} jawaban benar
						</p>

						<div class="mt-6 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
							<div class="rounded-xl bg-slate-50 p-4">
								<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Poin</p>
								<p class="mt-1 text-lg font-extrabold text-slate-900">
									{submitResult.earned_points}/{submitResult.total_points}
								</p>
							</div>
							<div class="rounded-xl bg-slate-50 p-4">
								<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
									Nilai lulus
								</p>
								<p class="mt-1 text-lg font-extrabold text-slate-900">
									{submitResult.passing_score}
								</p>
							</div>
							<div class="rounded-xl bg-slate-50 p-4">
								<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Status</p>
								<p
									class={cn(
										'mt-1 text-lg font-extrabold',
										submitResult.is_passed ? 'text-emerald-600' : 'text-amber-600'
									)}
								>
									{submitResult.is_passed ? 'Lulus' : 'Belum lulus'}
								</p>
							</div>
						</div>

						<Button href={backHref} class="mt-6 bg-sky-600 text-white">
							<ArrowLeftIcon class="size-4" /> Kembali ke materi
						</Button>
					</div>
				{:else if activeQuestion}
					<div class="flex items-center gap-3">
						<Badge class="bg-sky-50 text-sky-700">{skillLabels[activeQuestion.skill]}</Badge>
						<span class="text-sm text-slate-500">
							Soal {activeIndex + 1} dari {questions.length}
						</span>
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
									disabled={isSubmitting}
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
							disabled={isSubmitting}
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
								disabled={isSubmitting || Boolean(submitResult)}
								aria-label={`Buka soal ${index + 1}`}
								aria-current={activeIndex === index && !submitResult ? 'step' : undefined}
								class={cn(
									'relative aspect-square h-auto w-full rounded-xl p-0 font-bold',
									activeIndex === index && !submitResult
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
											activeIndex === index && !submitResult ? 'text-white' : 'text-emerald-500'
										)}
									/>
								{/if}
							</Button>
						{/each}
					</div>
				</Card.Root>

				{#if !submitResult && activeQuestion}
					<footer
						class={`flex shrink-0 items-center gap-4 ${activeIndex === 0 ? 'justify-end' : 'justify-between'}`}
					>
						<Button
							type="button"
							onclick={() => goToQuestion(activeIndex - 1)}
							disabled={activeIndex === 0 || isSubmitting}
							class={activeIndex === 0 ? 'hidden' : ''}
						>
							<ArrowLeftIcon class="size-4" />
						</Button>
						<Button type="button" onclick={goNext} disabled={isSubmitting}>
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

<Dialog.Root bind:open={isSubmitDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Kirim jawaban?</Dialog.Title>
			<Dialog.Description>
				Jawaban yang sudah dikirim tidak dapat diubah.
				{#if unansweredCount > 0}
					Masih ada {unansweredCount} soal yang belum dijawab.
				{:else}
					Semua soal sudah dijawab.
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		{#if submitError}
			<div class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
				{submitError}
			</div>
		{/if}

		<Dialog.Footer>
			<Button
				type="button"
				variant="outline"
				disabled={isSubmitting}
				onclick={() => (isSubmitDialogOpen = false)}
			>
				Periksa lagi
			</Button>
			<Button
				type="button"
				disabled={isSubmitting}
				isLoading={isSubmitting}
				onclick={handleSubmit}
				class="bg-sky-600 text-white"
			>
				{isSubmitting ? 'Mengirim...' : 'Ya, kirim jawaban'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
