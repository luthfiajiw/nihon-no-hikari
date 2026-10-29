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
	import { startQuestionSetAttemptUseCase } from '$dependencies/question.dependency';
	import type { Status } from '../../domain/entities/course.entity';
	import type { Lesson, ModuleLesson } from '../../domain/entities/lesson.entity';
	import LessonContent from '../components/lesson-content.svelte';
	import LessonContentSkeleton from '../components/lesson-content-skeleton.svelte';
	import LessonSidebar from '../components/lesson-sidebar.svelte';
	import { getCourseLearningContext } from '../contexts/course-learning-context';
	import {
		getLessonDetailUseCase,
		updateLessonProgressUseCase
	} from '$dependencies/course.dependency';

	interface Props {
		courseId: string;
		moduleLessons: ModuleLesson[];
		moduleExams: Record<string, QuestionSet[]>;
		errorMessage?: string | null;
	}

	let { courseId, moduleLessons, moduleExams, errorMessage = null }: Props = $props();
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
	const activeModuleLesson = $derived(
		moduleLessons.find(({ lessons }) => lessons.some((lesson) => lesson.id === activeLessonId))
	);
	const activeModuleExams = $derived(
		activeModuleLesson ? (moduleExams[activeModuleLesson.module.id] ?? []) : []
	);
	const canStartModuleExam = $derived(
		Boolean(activeModuleLesson?.lessons.length) &&
			activeModuleLesson?.lessons.every((lesson) => lesson.status === 'completed')
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

		const targetModuleLesson = moduleLessons.find(({ lessons }) =>
			lessons.some((candidate) => candidate.id === lessonId)
		);
		if (
			targetModuleLesson &&
			courseLearning.course &&
			courseLearning.module?.id !== targetModuleLesson.module.id
		) {
			courseLearning.select(courseLearning.course, targetModuleLesson.module);
		}

		courseLearning.selectLesson(lessonId);
	}

	async function handleQuestionSetSelect(questionSet: QuestionSet): Promise<void> {
		if (!activeLessonId || startingQuestionSetId) return;

		startingQuestionSetId = questionSet.id;
		questionSetAttemptError = null;

		try {
			const response = await startQuestionSetAttemptUseCase.exec(questionSet.id);

			if (!response.success || !('data' in response)) {
				throw new Error(response.message);
			}

			assessment.setAttemptResponse(response);

			const basePath = response.data.question_set.kind === 'final_exam' ? 'exam' : 'practice';
			const searchParams = new SvelteURLSearchParams(
				basePath === 'exam'
					? { courseId, moduleId: activeModuleLesson?.module.id ?? '' }
					: { courseId, lessonId: activeLessonId }
			);
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

	function updateLessonsStatus(updates: Array<{ lessonId: string; status: Status }>): void {
		const updateMap = new Map(updates.map((u) => [u.lessonId, u.status]));
		moduleLessons = moduleLessons.map((moduleLesson) => {
			const hasUnlockedLesson = moduleLesson.lessons.some(
				(lesson) => updateMap.has(lesson.id) && updateMap.get(lesson.id) !== 'locked'
			);
			return {
				...moduleLesson,
				module:
					hasUnlockedLesson && moduleLesson.module.status === 'locked'
						? { ...moduleLesson.module, status: 'unlocked' }
						: moduleLesson.module,
				lessons: moduleLesson.lessons.map((lesson) => {
					const newStatus = updateMap.get(lesson.id);
					return newStatus ? { ...lesson, status: newStatus } : lesson;
				})
			};
		});
	}

	function updateLessonStatus(lessonId: string, status: Status): void {
		updateLessonsStatus([{ lessonId, status }]);
	}

	async function handleNextLesson(): Promise<void> {
		if (!activeLessonId || !nextLesson || isNextLessonLoading) return;
		if (activeLesson?.status === 'completed') {
			if (nextLesson.status === 'locked') {
				updateLessonStatus(nextLesson.id, 'unlocked');
			}
			const nextModuleLesson = moduleLessons.find(({ lessons }) =>
				lessons.some((lesson) => lesson.id === nextLesson.id)
			);
			if (
				nextModuleLesson &&
				courseLearning.course &&
				courseLearning.module?.id !== nextModuleLesson.module.id
			) {
				courseLearning.select(courseLearning.course, nextModuleLesson.module);
			}
			courseLearning.selectLesson(nextLesson.id);
			return;
		}

		const currentLessonId = activeLessonId;
		const nextLessonId = nextLesson.id;
		const isNextLessonLocked = nextLesson.status === 'locked';
		isNextLessonLoading = true;

		try {
			const response = await updateLessonProgressUseCase.exec(currentLessonId, {
				status: 'completed'
			});

			if (!response.success) return;

			const shouldNavigateToNextLesson = activeLessonId === currentLessonId;
			const statusUpdates: Array<{ lessonId: string; status: Status }> = [
				{ lessonId: currentLessonId, status: 'completed' }
			];
			if (isNextLessonLocked) {
				statusUpdates.push({ lessonId: nextLessonId, status: 'unlocked' });
			}
			updateLessonsStatus(statusUpdates);

			if (shouldNavigateToNextLesson) {
				const nextModuleLesson = moduleLessons.find(({ lessons }) =>
					lessons.some((lesson) => lesson.id === nextLessonId)
				);
				if (
					nextModuleLesson &&
					courseLearning.course &&
					courseLearning.module?.id !== nextModuleLesson.module.id
				) {
					courseLearning.select(courseLearning.course, nextModuleLesson.module);
				}
				courseLearning.selectLesson(nextLessonId);
			}
		} catch (error) {
			lessonDetailError =
				error instanceof Error ? error.message : 'Gagal memperbarui progres materi.';
		} finally {
			isNextLessonLoading = false;
		}
	}

	async function loadLessonDetail(lessonId: string): Promise<void> {
		const requestId = ++lessonRequestId;
		const isLessonCompleted = moduleLessons
			.flatMap(({ lessons }) => lessons)
			.some((lesson) => lesson.id === lessonId && lesson.status === 'completed');
		lessonDetail = null;
		lessonDetailError = null;
		isLessonLoading = true;

		try {
			const response = await getLessonDetailUseCase.exec(lessonId);
			if (requestId !== lessonRequestId) return;

			if (!response.success || !('data' in response)) {
				throw new Error(response.message);
			}

			if (!isLessonCompleted) {
				const progressResponse = await updateLessonProgressUseCase.exec(lessonId, {
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
		const lessonId = activeLessonId;
		if (!lessonId) return;

		if (lastRequestedLessonKey === lessonId) return;
		lastRequestedLessonKey = lessonId;

		untrack(() => {
			void loadLessonDetail(lessonId);
		});
	});
</script>

<svelte:head>
	<title>{courseName ?? 'Kursus'} - Gakkobit</title>
	<meta name="description" content={courseName ?? 'Detail kursus'} />
</svelte:head>

{#if errorMessage}
	<div class="p-6">
		<Card.Root>
			<Card.Content class="py-10 text-center">
				<p class="font-semibold text-taupe-900 dark:text-taupe-100">Materi kursus tidak tersedia</p>
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
				<p class="font-semibold text-taupe-900 dark:text-taupe-100">Belum ada materi</p>
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
							<p class="font-semibold text-taupe-900 dark:text-taupe-100">
								Materi tidak dapat dimuat
							</p>
							<p class="mt-1 text-sm text-red-600 dark:text-red-400">{lessonDetailError}</p>
							<Button class="mt-5" type="button" onclick={() => loadLessonDetail(activeLessonId)}>
								Coba lagi
							</Button>
						</Card.Content>
					</Card.Root>
				</div>
			{:else}
				<LessonContent
					lessonId={activeLessonId}
					title={lessonDetail?.title ?? activeLesson?.title ?? 'Materi'}
					content={lessonDetail?.content ?? ''}
					questionSets={lessonDetail?.question_sets ?? []}
					moduleExams={activeModuleExams}
					{canStartModuleExam}
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
