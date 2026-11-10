export type Status = 'locked' | 'unlocked' | 'in_progress' | 'completed';

export interface CourseLevel {
	id: string;
	code: string;
	name: string;
}

export interface CourseLevelItem {
	id: string;
	code: string;
	name: string;
	tag?: string | null;
	description?: string | null;
	order_index: number;
	price: number;
	points?: string[];
	created_at?: string;
	updated_at?: string;
}

export interface ListLevelsResponse {
	success: boolean;
	data: CourseLevelItem[];
}

export interface Module {
	id: string;
	slug: string;
	title: string;
	description: string;
	is_mandatory: boolean;
	is_entry: boolean;
	status: Status;
	estimated_minutes: number;
}

export interface Course {
	id: string;
	slug: string;
	title: string;
	description: string;
	thumbnail_url?: string;
	total_minutes: number;
	total_lessons: number;
	level: CourseLevel;
}

export interface CourseDetail {
	id: string;
	slug: string;
	title: string;
	description: string;
	thumbnail_url?: string;
	total_minutes: number;
	total_lessons: number;
	level: CourseLevel;
	modules: Module[];
}

export interface ListCourseResponse {
	success: boolean;
	message: string;
	data: Course[];
}

export interface CourseDetailResponse {
	success: boolean;
	message: string;
	data: CourseDetail;
}

export interface UpdateModuleProgressRequest {
	status: Extract<Status, 'in_progress' | 'completed'>;
}

export interface UpdateModuleProgressResponse {
	success: boolean;
	message: string;
}
