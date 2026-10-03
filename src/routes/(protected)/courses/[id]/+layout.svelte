<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import {
		setCourseLearningContext,
		type CourseLearningSelection
	} from '$features/course/presentation/contexts/course-learning-context';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	const storageKeyPrefix = 'course-learning-selection:';

	const selection = $state<CourseLearningSelection>({
		course: null,
		module: null
	});

	function getStorageKey(courseId: string): string {
		return `${storageKeyPrefix}${courseId}`;
	}

	function restoreSelection(courseId: string): void {
		try {
			const serializedSelection = sessionStorage.getItem(getStorageKey(courseId));
			if (!serializedSelection) {
				selection.course = null;
				selection.module = null;
				return;
			}

			const storedSelection = JSON.parse(serializedSelection) as CourseLearningSelection;
			if (storedSelection.course?.id !== courseId || !storedSelection.module?.id) {
				sessionStorage.removeItem(getStorageKey(courseId));
				selection.course = null;
				selection.module = null;
				return;
			}

			selection.course = storedSelection.course;
			selection.module = storedSelection.module;
		} catch {
			selection.course = null;
			selection.module = null;
		}
	}

	function persistSelection(nextSelection: CourseLearningSelection): void {
		if (!browser || !nextSelection.course || !nextSelection.module) return;

		try {
			sessionStorage.setItem(getStorageKey(nextSelection.course.id), JSON.stringify(nextSelection));
		} catch {
			// Context remains usable when storage is unavailable or full.
		}
	}

	$effect(() => {
		const courseId = page.params.id;
		if (browser && courseId) restoreSelection(courseId);
	});

	setCourseLearningContext({
		get course() {
			return selection.course;
		},
		get module() {
			return selection.module;
		},
		select(course, module) {
			selection.course = course;
			selection.module = module;
			persistSelection({ course, module });
		}
	});
</script>

{@render children()}
