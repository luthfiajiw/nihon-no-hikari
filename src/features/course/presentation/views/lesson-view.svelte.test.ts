import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import type { QuestionSet } from '$features/question/domain/entities/question.entity';
import type { Course, Module, Status } from '../../domain/entities/course.entity';
import type { Lesson, ModuleLesson } from '../../domain/entities/lesson.entity';
import type { CourseLearningContext } from '../contexts/course-learning-context';
import Fixture from './lesson-view.test-fixture.svelte';
import '../../../../routes/layout.css';

const mock = vi.hoisted(() => ({
	getLessonDetail: vi.fn(),
	updateProgress: vi.fn(),
	goto: vi.fn()
}));

vi.mock('$dependencies/course.dependency', () => ({
	getLessonDetailUseCase: { exec: mock.getLessonDetail },
	updateLessonProgressUseCase: { exec: mock.updateProgress }
}));
vi.mock('$dependencies/question.dependency', () => ({
	startQuestionSetAttemptUseCase: { exec: vi.fn() }
}));
vi.mock('$app/navigation', () => ({ goto: mock.goto }));
vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const course = { id: 'course-1', title: 'Kursus Uji' } as Course;

function lesson(id: string, status: Status): Lesson {
	return { id, slug: id, title: `Materi ${id}`, status, question_sets: [] };
}

function moduleLesson(id: string, status: Status, lessons: Lesson[]): ModuleLesson {
	return { module: { id, title: `Modul ${id}`, status } as Module, lessons };
}

function exam(isPassed: boolean): QuestionSet {
	return {
		id: 'exam-1',
		title: 'Ujian Modul',
		kind: 'final_exam',
		is_passed: isPassed,
		question_count: 5
	} as QuestionSet;
}

function createLearning(moduleLessons: ModuleLesson[], lessonId: string) {
	let selectedModule = $state<Module | null>(
		moduleLessons.find((entry) => entry.lessons.some((item) => item.id === lessonId))?.module ??
			null
	);
	let selectedLessonId = $state<string | null>(lessonId);
	const learning = {
		get course() {
			return course;
		},
		get module() {
			return selectedModule;
		},
		get lessonId() {
			return selectedLessonId;
		},
		select: vi.fn((_course: Course, nextModule: Module) => {
			selectedModule = nextModule;
		}),
		selectLesson: vi.fn((id: string) => {
			selectedLessonId = id;
		})
	} satisfies CourseLearningContext;
	return learning;
}

let component: ReturnType<typeof mount> | undefined;

function render(
	moduleLessons: ModuleLesson[],
	lessonId: string,
	moduleExams: Record<string, QuestionSet[]> = {}
) {
	const learning = createLearning(moduleLessons, lessonId);
	component = mount(Fixture, {
		target: document.body,
		props: { learning, moduleLessons, moduleExams }
	});
	return learning;
}

function findButton(label: string): HTMLButtonElement | undefined {
	const content = document.body.querySelector('article');
	if (!content) return undefined;
	return Array.from(content.querySelectorAll('button')).find((button) =>
		button.textContent?.includes(label)
	);
}

async function waitForButton(label: string): Promise<HTMLButtonElement> {
	await vi.waitFor(() => expect(findButton(label)).toBeTruthy());
	return findButton(label)!;
}

async function click(label: string) {
	const button = await waitForButton(label);
	await vi.waitFor(() => expect(button.disabled, button.outerHTML).toBe(false));
	button.click();
	flushSync();
}

function progress(moduleId: string, status: Status, moduleStatus: Status) {
	return {
		success: true,
		message: 'ok',
		data: {
			user_id: 'user-1',
			lesson_id: 'lesson',
			module_id: moduleId,
			status,
			module_status: moduleStatus,
			completed_at: null,
			updated_at: '2026-01-01T00:00:00Z'
		}
	};
}

beforeEach(() => {
	mock.getLessonDetail.mockImplementation(async (id: string) => ({
		success: true,
		message: 'ok',
		data: { ...lesson(id, 'in_progress'), content: '<p>Isi materi</p>' }
	}));
});

afterEach(() => {
	if (component) void unmount(component);
	component = undefined;
	document.body.innerHTML = '';
	vi.clearAllMocks();
});

describe('LessonView module progress synchronization', () => {
	it('syncs module_status from opening an uncompleted lesson into the course learning context', async () => {
		mock.updateProgress.mockResolvedValue(progress('m1', 'in_progress', 'in_progress'));
		const learning = render(
			[moduleLesson('m1', 'unlocked', [lesson('l1', 'unlocked'), lesson('l2', 'locked')])],
			'l1'
		);

		await vi.waitFor(() => expect(learning.select).toHaveBeenCalled());
		expect(mock.updateProgress).toHaveBeenCalledWith('l1', { status: 'in_progress' });
		const [, syncedModule] = learning.select.mock.calls[0];
		expect(syncedModule).toMatchObject({ id: 'm1', status: 'in_progress' });
	});

	it('completes a module without a final exam, unlocks the next module and advances', async () => {
		mock.updateProgress.mockImplementation(async (_id: string, body: { status: Status }) =>
			body.status === 'completed'
				? progress('m1', 'completed', 'completed')
				: progress('m1', 'in_progress', 'in_progress')
		);
		const learning = render(
			[
				moduleLesson('m1', 'in_progress', [lesson('l1', 'in_progress')]),
				moduleLesson('m2', 'locked', [lesson('l2', 'locked')])
			],
			'l1'
		);

		await click('Materi l2');

		await vi.waitFor(() => expect(learning.selectLesson).toHaveBeenCalledWith('l2'));
		expect(mock.updateProgress).toHaveBeenCalledWith('l1', { status: 'completed' });
		expect(learning.select).toHaveBeenCalledWith(
			course,
			expect.objectContaining({ id: 'm1', status: 'completed' })
		);
		expect(learning.select).toHaveBeenCalledWith(
			course,
			expect.objectContaining({ id: 'm2', status: 'unlocked' })
		);
	});

	it('stays on the last lesson of a module with an incomplete final exam and unlocks the exam', async () => {
		mock.updateProgress.mockImplementation(async (_id: string, body: { status: Status }) =>
			progress('m1', body.status, 'in_progress')
		);
		const learning = render(
			[
				moduleLesson('m1', 'in_progress', [lesson('l1', 'in_progress')]),
				moduleLesson('m2', 'locked', [lesson('l2', 'locked')])
			],
			'l1',
			{ m1: [exam(false)] }
		);

		const examButton = await waitForButton('Mulai Ujian');
		expect(examButton.disabled).toBe(true);

		await click('Selesaikan Materi');

		await vi.waitFor(() => expect(findButton('Mulai Ujian')?.disabled).toBe(false));
		expect(learning.selectLesson).not.toHaveBeenCalled();
		expect(mock.updateProgress).toHaveBeenCalledWith('l1', { status: 'completed' });
		const nextButton = findButton('Materi l2');
		expect(nextButton).toBeTruthy();
		expect(nextButton?.disabled).toBe(true);
	});

	it('finishes the last lesson of the course, then returns to the course detail', async () => {
		mock.updateProgress.mockImplementation(async (_id: string, body: { status: Status }) =>
			progress('m1', body.status, body.status === 'completed' ? 'completed' : 'in_progress')
		);
		const learning = render(
			[moduleLesson('m1', 'in_progress', [lesson('l1', 'in_progress')])],
			'l1'
		);

		await click('Selesaikan Materi');
		await waitForButton('Kembali ke Detail Kursus');
		expect(learning.selectLesson).not.toHaveBeenCalled();
		expect(mock.goto).not.toHaveBeenCalled();

		await click('Kembali ke Detail Kursus');
		await vi.waitFor(() => expect(mock.goto).toHaveBeenCalledWith('/courses/course-1'));
	});
});
