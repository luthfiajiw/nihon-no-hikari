export type QuestionSkill = 'reading' | 'writing' | 'listening' | 'speaking';

export type QuestionKind = 'practice' | 'final_exam';

export type QuestionType = 'multiple_choice' | 'stroke_writing';

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
