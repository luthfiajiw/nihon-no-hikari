<script lang="ts">
	import type { QuestionSet } from '$features/question/domain/entities/question.entity';
	import { setAssessmentContext } from '$features/question/presentation/contexts/assessment-context';
	import type { ModuleLesson } from '../../domain/entities/lesson.entity';
	import {
		setCourseLearningContext,
		type CourseLearningContext
	} from '../contexts/course-learning-context';
	import LessonView from './lesson-view.svelte';

	interface Props {
		learning: CourseLearningContext;
		moduleLessons: ModuleLesson[];
		moduleExams: Record<string, QuestionSet[]>;
	}

	const { learning, moduleLessons, moduleExams }: Props = $props();
	// svelte-ignore state_referenced_locally
	setCourseLearningContext(learning);
	setAssessmentContext({
		attemptResponse: null,
		setAttemptResponse: () => {},
		clearAttemptResponse: () => {}
	});
</script>

<LessonView courseId="course-1" {moduleLessons} {moduleExams} />
