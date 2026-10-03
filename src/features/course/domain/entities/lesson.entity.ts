import type { Module, Status } from './course.entity';

export interface Lesson {
	id: string;
	slug: string;
	title: string;
	content?: string;
	status?: Status;
}

export interface ModuleLesson {
	module: Module;
	lessons: Lesson[];
}

export interface ListModuleLessonResponse {
	success: boolean;
	message: string;
	data: ModuleLesson[];
}

export interface LessonDetailResponse {
	success: boolean;
	message: string;
	data: Lesson;
}

export interface UpdateLessonProgressRequest {
	status: Extract<Status, 'unlocked' | 'in_progress' | 'completed'>;
}

export interface UpdateLessonProgressResponse {
	success: boolean;
	message: string;
}
