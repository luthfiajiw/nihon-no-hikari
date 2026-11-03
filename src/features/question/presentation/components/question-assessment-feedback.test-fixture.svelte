<script lang="ts">
	import { untrack } from 'svelte';
	import type { Question } from '$features/question/domain/entities/question.entity';
	import AssessmentQuestionCard from './assessment-question-card.svelte';
	import AssessmentQuestionNavigator from './assessment-question-navigator.svelte';

	interface Props {
		question: Question;
		immediateFeedback?: boolean;
		initialAnswer?: string;
		questions?: Question[];
		initialAnswers?: Record<string, string>;
	}

	let {
		question,
		immediateFeedback = true,
		initialAnswer = '',
		questions = [question],
		initialAnswers = initialAnswer ? { [question.id]: initialAnswer } : {}
	}: Props = $props();

	let answer = $state(untrack(() => initialAnswer));
	let answers = $state<Record<string, string>>(untrack(() => ({ ...initialAnswers })));
	let activeIndex = $state(0);

	function handleAnswerChange(value: string) {
		answer = value;
		answers[question.id] = value;
	}
</script>

<div class="test-fixture">
	<AssessmentQuestionCard
		{question}
		questionNumber={1}
		totalQuestions={questions.length}
		{answer}
		{immediateFeedback}
		onAnswerChange={handleAnswerChange}
		onStrokeChange={() => {}}
		onPrevious={() => {}}
		onNext={() => {}}
	/>

	<AssessmentQuestionNavigator
		{questions}
		{answers}
		{activeIndex}
		{immediateFeedback}
		onQuestionSelect={(idx) => (activeIndex = idx)}
	/>
</div>
