<script lang="ts">
	import { beforeNavigate, onNavigate } from '$app/navigation';
	import type {
		AttemptResult,
		QuestionKind,
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
	const answeredCount = $derived(
		questions.filter((question) => Boolean(answers[question.id]?.trim())).length
	);
	const unansweredCount = $derived(questions.length - answeredCount);

	function abandonPracticeAttempt(): Promise<void> | undefined {
		if (
			expectedKind !== 'practice' ||
			submitResult ||
			!courseId ||
			!lessonId ||
			!attempt ||
			attempt.status !== 'in_progress'
		) {
			return;
		}

		if (abandonRequest) return abandonRequest;

		const endpoint = `/api/v1/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/question-sets/${encodeURIComponent(questionSetId)}/attempts/${encodeURIComponent(attempt.id)}/abandon`;
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
				<AssessmentQuestionCard
					question={activeQuestion}
					questionNumber={activeIndex + 1}
					totalQuestions={questions.length}
					answer={answers[activeQuestion.id] || ''}
					disabled={isSubmitting}
					onAnswerChange={setAnswer}
					onPrevious={() => goToQuestion(activeIndex - 1)}
					onNext={goNext}
				/>
			{/if}

			<AssessmentQuestionNavigator
				{questions}
				{answers}
				{activeIndex}
				disabled={isSubmitting || Boolean(submitResult)}
				onQuestionSelect={goToQuestion}
			/>
		</div>
	{/if}
</main>

<AssessmentSubmitDialog
	bind:open={isSubmitDialogOpen}
	{unansweredCount}
	{submitError}
	{isSubmitting}
	onSubmit={handleSubmit}
/>
