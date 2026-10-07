export type QuestionSkill = 'reading' | 'writing' | 'listening' | 'speaking';

export type QuestionKind = 'practice' | 'final_exam';

export type QuestionType = 'multiple_choice' | 'stroke_writing';

export type AttemptStatus = 'in_progress' | 'submitted' | 'abandoned';

export interface QuestionSet {
	id: string;
	title: string;
	skill?: QuestionSkill;
	kind: QuestionKind;
	passing_score: number;
	question_count: number;
	time_limit_seconds?: number;
	max_attempts?: number;
	cooldown_minutes: number;
	shuffle_questions: boolean;
	is_passed: boolean;
	attempts_used: number;
}

export interface QuestionSetDetail {
	id: string;
	title: string;
	skill?: QuestionSkill;
	kind: QuestionKind;
	passing_score: number;
	question_count: number;
	time_limit_seconds?: number;
	max_attempts?: number;
	cooldown_minutes: number;
	shuffle_questions: boolean;
	is_passed: boolean;
	attempts_used: number;
	questions?: Question[];
}

export interface Question {
	id: string;
	question_type: QuestionType;
	skill: QuestionSkill;
	prompt_text: string;
	stimulus_text: string;
	stimulus_media_url?: string;
	points: number;
	order_index: number;
	options?: QuestionOption[];
}

export interface QuestionOption {
	id: string;
	label: string;
	media_url?: string;
	order_index: number;
}

export interface QuestionSetDetailResponse {
	success: boolean;
	message: string;
	data: QuestionSetDetail;
}

export interface Attempt {
	id: string;
	number: number;
	status: AttemptStatus;
	startedAt: string;
	expiresAt?: string;
	question_set: QuestionSet;
	questions: Question[];
}

export interface AttemptResponse {
	success: boolean;
	message: string;
	data: Attempt;
}

export interface SubmitAnswerRequest {
	question_id: string;
	selected_option_id: string | null;
	stroke_input: unknown;
}

export interface SubmitAttemptRequest {
	answers: SubmitAnswerRequest[];
}

export interface AnswerResult {
	question_id: string;
	skill: QuestionSkill;
	is_correct: boolean;
	earned_points: number;
	max_points: number;
	explanation: string | null;
}

export interface SkillResult {
	skill: QuestionSkill;
	score: number;
	earned_points: number;
	total_points: number;
	is_passed: boolean;
}

export interface AttemptResult {
	attempt_id: string;
	score: number;
	earned_points: number;
	total_points: number;
	passing_score: number;
	is_passed: boolean;
	lesson_status: string;
	submitted_at: string;
	skills: SkillResult[];
	answers: AnswerResult[];
}

export interface SubmitAttemptResponse {
	success: boolean;
	message: string;
	data: AttemptResult;
}
