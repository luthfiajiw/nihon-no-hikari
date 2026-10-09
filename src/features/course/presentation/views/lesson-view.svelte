<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { untrack } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { QuestionSet } from '$features/question/domain/entities/question.entity';
	import { getAssessmentContext } from '$features/question/presentation/contexts/assessment-context';
	import { startQuestionSetAttempt } from '$features/question/presentation/remotes/start-question-set-attempt.remote';
	import type { Status } from '../../domain/entities/course.entity';
	import type { Lesson, ModuleLesson } from '../../domain/entities/lesson.entity';
	import LessonContent from '../components/lesson-content.svelte';
	import LessonContentSkeleton from '../components/lesson-content-skeleton.svelte';
	import LessonSidebar from '../components/lesson-sidebar.svelte';
	import { getCourseLearningContext } from '../contexts/course-learning-context';
	import { getLessonDetail } from '../remotes/get-lesson-detail.remote';
	import { updateLessonProgress } from '../remotes/update-lesson-progress.remote';

	interface Props {
		courseId: string;
		moduleLessons: ModuleLesson[];
		errorMessage?: string | null;
	}

	let { courseId, moduleLessons, errorMessage = null }: Props = $props();
	const courseLearning = getCourseLearningContext();
	const assessment = getAssessmentContext();

	const courseName = $derived(courseLearning.course?.title ?? 'Kursus');

	function findLessonByStatus(status: Status): Lesson | undefined {
		return moduleLessons
			.flatMap(({ lessons }) => lessons)
			.find((lesson) => lesson.status === status);
	}

	function getInitialLessonId(): string {
		const lastSelectedLesson = moduleLessons
			.flatMap(({ lessons }) => lessons)
			.find((lesson) => lesson.id === courseLearning.lessonId && lesson.status !== 'locked');
		const selectedModule = moduleLessons.find(
			({ module }) => module.id === courseLearning.module?.id
		);
		const selectedModuleLesson =
			selectedModule?.lessons.find((lesson) => lesson.status === 'in_progress') ??
			selectedModule?.lessons.find((lesson) => lesson.status === 'unlocked') ??
			selectedModule?.lessons.find((lesson) => lesson.status !== 'locked');

		return (
			(
				lastSelectedLesson ??
				selectedModuleLesson ??
				findLessonByStatus('in_progress') ??
				findLessonByStatus('unlocked') ??
				moduleLessons.flatMap(({ lessons }) => lessons).find((lesson) => lesson.status !== 'locked')
			)?.id ?? ''
		);
	}

	const modules = $derived(
		moduleLessons.map(({ module, lessons }, moduleIndex) => ({
			id: module.id,
			title: module.title,
			order: String(moduleIndex + 1),
			completedCount: `${lessons.filter((lesson) => lesson.status === 'completed').length}/${lessons.length}`,
			lessons: lessons.map((lesson, lessonIndex) => ({
				id: lesson.id,
				title: lesson.title,
				order: `${moduleIndex + 1}.${lessonIndex + 1}`,
				status: lesson.status
			}))
		}))
	);

	let isSidebarOpen = $state(true);
	let lessonDetail = $state<Lesson | null>(null);
	let lessonDetailError = $state<string | null>(null);
	let isLessonLoading = $state(true);
	let isNextLessonLoading = $state(false);
	let startingQuestionSetId = $state<string | null>(null);
	let questionSetAttemptError = $state<string | null>(null);
	let lessonRequestId = 0;
	let lastRequestedLessonKey: string | null = null;
	const activeLessonId = $derived(getInitialLessonId());
	const activeLesson = $derived(
		moduleLessons
			.flatMap(({ lessons }) => lessons)
			.find((lesson) => lesson.id === activeLessonId) ?? null
	);
	const orderedLessons = $derived(moduleLessons.flatMap(({ lessons }) => lessons));
	const activeLessonIndex = $derived(
		orderedLessons.findIndex((lesson) => lesson.id === activeLessonId)
	);
	const previousLesson = $derived(
		activeLessonIndex > 0 ? orderedLessons[activeLessonIndex - 1] : undefined
	);
	const nextLesson = $derived(
		activeLessonIndex >= 0 && activeLessonIndex < orderedLessons.length - 1
			? orderedLessons[activeLessonIndex + 1]
			: undefined
	);
	const completedLessons = $derived(
		moduleLessons.reduce(
			(total, { lessons }) =>
				total + lessons.filter((lesson) => lesson.status === 'completed').length,
			0
		)
	);
	const totalLessons = $derived(
		moduleLessons.reduce((total, { lessons }) => total + lessons.length, 0)
	);

	function toggleSidebar(): void {
		isSidebarOpen = !isSidebarOpen;
	}

	function handleLessonSelect(lessonId: string): void {
		const lesson = moduleLessons
			.flatMap(({ lessons }) => lessons)
			.find((candidate) => candidate.id === lessonId);
		if (!lesson || lesson.status === 'locked') return;

		courseLearning.selectLesson(lessonId);
	}

	async function handleQuestionSetSelect(questionSet: QuestionSet): Promise<void> {
		if (!activeLessonId || startingQuestionSetId) return;

		startingQuestionSetId = questionSet.id;
		questionSetAttemptError = null;

		try {
			const response = await startQuestionSetAttempt({
				courseId,
				lessonId: activeLessonId,
				questionSetId: questionSet.id
			});

			if (!response.success || !('data' in response)) {
				throw new Error(response.message);
			}

			assessment.setAttemptResponse(response);

			const basePath = response.data.question_set.kind === 'final_exam' ? 'exam' : 'practice';
			const searchParams = new SvelteURLSearchParams({
				courseId,
				lessonId: activeLessonId
			});
			const href = `/${basePath}/${encodeURIComponent(questionSet.id)}?${searchParams.toString()}`;

			await goto(resolve(href as Pathname));
		} catch (error) {
			assessment.clearAttemptResponse();
			questionSetAttemptError =
				error instanceof Error ? error.message : 'Gagal memulai pengerjaan soal.';
		} finally {
			startingQuestionSetId = null;
		}
	}

	function updateLessonStatus(lessonId: string, status: Status): void {
		moduleLessons = moduleLessons.map((moduleLesson) => ({
			...moduleLesson,
			lessons: moduleLesson.lessons.map((lesson) =>
				lesson.id === lessonId ? { ...lesson, status } : lesson
			)
		}));
	}

	async function handleNextLesson(): Promise<void> {
		if (!activeLessonId || !nextLesson || isNextLessonLoading) return;

		const currentLessonId = activeLessonId;
		const nextLessonId = nextLesson.id;
		isNextLessonLoading = true;

		try {
			const response = await updateLessonProgress({
				courseId,
				lessonId: currentLessonId,
				status: 'completed'
			});

			if (!response.success) return;

			const shouldNavigateToNextLesson = activeLessonId === currentLessonId;
			updateLessonStatus(currentLessonId, 'completed');
			if (shouldNavigateToNextLesson) courseLearning.selectLesson(nextLessonId);
		} finally {
			isNextLessonLoading = false;
		}
	}

	async function loadLessonDetail(requestCourseId: string, lessonId: string): Promise<void> {
		const requestId = ++lessonRequestId;
		const isLessonCompleted = moduleLessons
			.flatMap(({ lessons }) => lessons)
			.some((lesson) => lesson.id === lessonId && lesson.status === 'completed');
		lessonDetail = null;
		lessonDetailError = null;
		isLessonLoading = true;

		try {
			const response = await getLessonDetail({ courseId: requestCourseId, lessonId });
			if (requestId !== lessonRequestId) return;

			if (!response.success || !('data' in response)) {
				throw new Error(response.message);
			}

			if (!isLessonCompleted) {
				const progressResponse = await updateLessonProgress({
					courseId: requestCourseId,
					lessonId,
					status: 'in_progress'
				});
				if (requestId !== lessonRequestId) return;

				if (!progressResponse.success) {
					throw new Error(progressResponse.message);
				}

				updateLessonStatus(lessonId, 'in_progress');
			}

			lessonDetail = response.data;
		} catch (error) {
			if (requestId !== lessonRequestId) return;
			lessonDetailError = error instanceof Error ? error.message : 'Gagal mengambil detail materi.';
		} finally {
			if (requestId === lessonRequestId) isLessonLoading = false;
		}
	}

	$effect(() => {
		const requestCourseId = courseId;
		const lessonId = activeLessonId;
		if (!requestCourseId || !lessonId) return;

		const lessonKey = `${requestCourseId}:${lessonId}`;
		if (lastRequestedLessonKey === lessonKey) return;
		lastRequestedLessonKey = lessonKey;

		untrack(() => {
			void loadLessonDetail(requestCourseId, lessonId);
		});
	});
</script>

<svelte:head>
	<title>{courseName ?? 'Kursus'} - Nihongo no Hikari</title>
	<meta name="description" content={courseName ?? 'Detail kursus'} />
</svelte:head>

{#if errorMessage}
	<div class="p-6">
		<Card.Root>
			<Card.Content class="py-10 text-center">
				<p class="font-semibold text-slate-900 dark:text-slate-100">Materi kursus tidak tersedia</p>
				<p class="mt-1 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
				<Button class="mt-5" type="button" onclick={() => goto(resolve('/courses'))}>
					Kembali ke daftar kursus
				</Button>
			</Card.Content>
		</Card.Root>
	</div>
{:else if moduleLessons.length === 0 || totalLessons === 0}
	<div class="p-6">
		<Card.Root>
			<Card.Content class="py-10 text-center">
				<p class="font-semibold text-slate-900 dark:text-slate-100">Belum ada materi</p>
				<p class="mt-1 text-sm text-muted-foreground">
					Modul dan materi untuk kursus ini belum tersedia.
				</p>
			</Card.Content>
		</Card.Root>
	</div>
{:else}
	<div class="flex h-full w-full overflow-hidden bg-background">
		<div class="h-full min-w-0 flex-1 overflow-hidden">
			{#if isLessonLoading}
				<LessonContentSkeleton />
			{:else if lessonDetailError}
				<div class="flex h-full items-center justify-center p-6">
					<Card.Root class="w-full max-w-lg">
						<Card.Content class="py-10 text-center">
							<p class="font-semibold text-slate-900 dark:text-slate-100">
								Materi tidak dapat dimuat
							</p>
							<p class="mt-1 text-sm text-red-600 dark:text-red-400">{lessonDetailError}</p>
							<Button
								class="mt-5"
								type="button"
								onclick={() => loadLessonDetail(courseId, activeLessonId)}
							>
								Coba lagi
							</Button>
						</Card.Content>
					</Card.Root>
				</div>
			{:else}
				<LessonContent
					title={lessonDetail?.title ?? activeLesson?.title ?? 'Materi'}
					content={lessonDetail?.content ?? ''}
					questionSets={lessonDetail?.question_sets ?? []}
					{startingQuestionSetId}
					questionSetError={questionSetAttemptError}
					previousLessonTitle={previousLesson?.title}
					nextLessonTitle={nextLesson?.title}
					onPreviousLesson={previousLesson
						? () => handleLessonSelect(previousLesson.id)
						: undefined}
					onNextLesson={nextLesson ? handleNextLesson : undefined}
					onQuestionSetSelect={handleQuestionSetSelect}
					{isNextLessonLoading}
				/>
			{/if}
		</div>

		<LessonSidebar
			{courseName}
			{completedLessons}
			{totalLessons}
			{modules}
			{activeLessonId}
			isOpen={isSidebarOpen}
			onToggle={toggleSidebar}
			onLessonSelect={handleLessonSelect}
		/>
	</div>
{/if}
