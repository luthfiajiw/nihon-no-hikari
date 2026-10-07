import { createContext } from 'svelte';
import type { AttemptResponse } from '../../domain/entities/question.entity';

export interface AssessmentContext {
	readonly attemptResponse: AttemptResponse | null;
	setAttemptResponse: (response: AttemptResponse) => void;
	clearAttemptResponse: () => void;
}

export const [getAssessmentContext, setAssessmentContext] = createContext<AssessmentContext>();
