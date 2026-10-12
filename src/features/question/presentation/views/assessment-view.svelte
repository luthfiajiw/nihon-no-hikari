<script lang="ts">
	import { beforeNavigate, onNavigate } from '$app/navigation';
	import * as Drawer from '$lib/components/ui/drawer';
	import { ListIcon, XIcon } from 'lucide-svelte';
	import type {
		AttemptResult,
		QuestionKind,
		Question,
		StrokeInput,
		SubmitAttemptRequest
	} from '$features/question/domain/entities/question.entity';
	import AssessmentQuestionCard from '../components/assessment-question-card.svelte';
	import AssessmentQuestionNavigator from '../components/assessment-question-navigator.svelte';
	import AssessmentResultCard from '../components/assessment-result-card.svelte';
	import AssessmentStatusCard from '../components/assessment-status-card.svelte';
	import AssessmentSubmitDialog from '../components/assessment-submit-dialog.svelte';
	import { getAssessmentContext } from '../contexts/assessment-context';
	import { submitQuestionSetAttempt } from '../remotes/submit-question-set-attempt.remote';

	interface Props {
		questionSetId: string;
		expectedKind: QuestionKind;
		backHref: string;
		errorMessage?: string | null;
	}

	let { questionSetId, expectedKind, backHref, errorMessage = null }: Props = $props();

	const assessment = getAssessmentContext();
	let activeIndex = $state(0);
	let answers = $state<Record<string, string | StrokeInput>>({});
	let isSubmitDialogOpen = $state(false);
	let isQuestionDrawerOpen = $state(false);
	let isSubmitting = $state(false);
	let submitError = $state<string | null>(null);
	let submitResult = $state<AttemptResult | null>(null);
	let abandonRequest: Promise<void> | null = null;

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
	function isAnswered(question: Question): boolean {
		const answer = answers[question.id];
		return question.question_type === 'stroke_writing'
			? Array.isArray(answer) &&
					Boolean(question.writing_guide && answer.length === question.writing_guide.strokes.length)
			: typeof answer === 'string' && Boolean(answer.trim());
	}
	const answeredCount = $derived(questions.filter(isAnswered).length);
	const unansweredCount = $derived(questions.length - answeredCount);
	const firstIncompleteIndex = $derived(questions.findIndex((question) => !isAnswered(question)));
	const maxAccessibleIndex = $derived(
		questionSet?.skill === 'writing' && firstIncompleteIndex !== -1
			? firstIncompleteIndex
			: questions.length - 1
	);

	function abandonPracticeAttempt(): Promise<void> | undefined {
		if (
			expectedKind !== 'practice' ||
			submitResult ||
			!attempt ||
			attempt.status !== 'in_progress'
		) {
			return;
		}

		if (abandonRequest) return abandonRequest;

		const endpoint = `/api/v1/question-sets/${encodeURIComponent(questionSetId)}/attempts/${encodeURIComponent(attempt.id)}/abandon`;
		abandonRequest = fetch(endpoint, {
			method: 'POST',
			headers: { Accept: 'application/json' },
			keepalive: true
		})
			.then((response) => {
				if (response.ok) assessment.clearAttemptResponse();
			})
			.catch(() => {
				// Navigasi tetap dilanjutkan jika request abandon gagal.
			});

		return abandonRequest;
	}

	beforeNavigate(({ willUnload }) => {
		if (willUnload) void abandonPracticeAttempt();
	});

	onNavigate(() => abandonPracticeAttempt());

	function setAnswer(value: string): void {
		if (!isSubmitting && !submitResult && activeQuestion) answers[activeQuestion.id] = value;
	}

	function setStrokeAnswer(value: StrokeInput): void {
		if (!isSubmitting && !submitResult && activeQuestion) answers[activeQuestion.id] = value;
	}

	function goToQuestion(index: number): void {
		if (
			isSubmitting ||
			submitResult ||
			index < 0 ||
			index >= questions.length ||
			index > maxAccessibleIndex
		)
			return;
		activeIndex = index;
	}

	function selectQuestionFromDrawer(index: number): void {
		goToQuestion(index);
		isQuestionDrawerOpen = false;
	}

	function goNext(): void {
		if (isSubmitting || submitResult) return;
		if (activeQuestion?.question_type === 'stroke_writing' && !isAnswered(activeQuestion)) return;
		if (
			activeIndex === questions.length - 1 &&
			questionSet?.skill === 'writing' &&
			unansweredCount > 0
		)
			return;
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
				const answer = answers[question.id];

				return {
					question_id: question.id,
					selected_option_id:
						question.question_type === 'multiple_choice' && typeof answer === 'string'
							? answer.trim() || null
							: null,
					stroke_input:
						question.question_type === 'stroke_writing' && Array.isArray(answer) ? answer : null
				};
			})
		};
	}

	async function handleSubmit(): Promise<void> {
		if (isSubmitting || submitResult) return;
		if (!attempt) {
			submitError = 'Data pengerjaan tidak lengkap. Kembali ke materi dan mulai ulang.';
			return;
		}

		isSubmitting = true;
		submitError = null;

		try {
			const response = await submitQuestionSetAttempt({
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

<main
	class="mx-auto flex h-full max-w-screen-xl flex-col overflow-y-auto px-4 pt-5 pb-28 xl:overflow-hidden xl:pb-5"
>
	{#if errorMessage || !attempt || !questionSet}
		<AssessmentStatusCard variant="error" {backHref} {errorMessage} {isSubmitting} />
	{:else if questions.length === 0}
		<AssessmentStatusCard variant="empty" {backHref} {isSubmitting} />
	{:else}
		<div
			class="grid min-h-0 flex-1 content-start items-start gap-5 xl:grid-cols-[minmax(0,1fr)_350px]"
		>
			{#if submitResult}
				<AssessmentResultCard result={submitResult} {assessmentLabel} {backHref} />
			{:else if activeQuestion}
				{#key activeQuestion.id}<AssessmentQuestionCard
						question={activeQuestion}
						questionNumber={activeIndex + 1}
						totalQuestions={questions.length}
						answer={typeof answers[activeQuestion.id] === 'string'
							? (answers[activeQuestion.id] as string)
							: ''}
						strokeAnswer={Array.isArray(answers[activeQuestion.id])
							? (answers[activeQuestion.id] as StrokeInput)
							: []}
						disabled={isSubmitting}
						onAnswerChange={setAnswer}
						onStrokeChange={setStrokeAnswer}
						onPrevious={() => goToQuestion(activeIndex - 1)}
						onNext={goNext}
					/>{/key}
			{/if}

			<div class="hidden xl:block">
				<AssessmentQuestionNavigator
					{questions}
					{answers}
					{activeIndex}
					{maxAccessibleIndex}
					disabled={isSubmitting || Boolean(submitResult)}
					onQuestionSelect={goToQuestion}
				/>
			</div>
		</div>

		{#if !submitResult}
			<Drawer.Root
				bind:open={isQuestionDrawerOpen}
				direction="bottom"
				shouldScaleBackground={false}
			>
				<Drawer.Trigger
					class="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 mx-auto flex h-14 max-w-md items-center justify-between rounded-full bg-sky-600 px-5 text-sm font-bold text-white shadow-lg shadow-sky-900/20 xl:hidden"
				>
					<span class="flex items-center gap-2"><ListIcon class="size-5" /> Nomor soal</span>
					<span>Soal {activeIndex + 1} / {questions.length}</span>
				</Drawer.Trigger>
				<Drawer.Content
					class="overflow-hidden rounded-t-2xl border-slate-200 bg-white p-0 data-[vaul-drawer-direction=bottom]:max-h-[85svh] xl:hidden"
				>
					<Drawer.Header class="sr-only">
						<Drawer.Title>Daftar nomor soal</Drawer.Title>
						<Drawer.Description
							>Pilih nomor soal untuk berpindah ke soal tersebut.</Drawer.Description
						>
					</Drawer.Header>
					<Drawer.Close
						class="absolute top-2 right-3 z-10 flex size-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
						aria-label="Tutup daftar soal"
					>
						<XIcon class="size-5" />
					</Drawer.Close>
					<div class="min-h-0 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
						<AssessmentQuestionNavigator
							{questions}
							{answers}
							{activeIndex}
							{maxAccessibleIndex}
							disabled={isSubmitting}
							onQuestionSelect={selectQuestionFromDrawer}
						/>
					</div>
				</Drawer.Content>
			</Drawer.Root>
		{/if}
	{/if}
</main>

<AssessmentSubmitDialog
	bind:open={isSubmitDialogOpen}
	{unansweredCount}
	{submitError}
	{isSubmitting}
	onSubmit={handleSubmit}
/>
