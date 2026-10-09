import { createContext } from 'svelte';
import type { Course, Module } from '../../domain/entities/course.entity';

export interface CourseLearningSelection {
	course: Course | null;
	module: Module | null;
	lessonId: string | null;
}

export interface CourseLearningContext extends Readonly<CourseLearningSelection> {
	select: (course: Course, module: Module) => void;
	selectLesson: (lessonId: string) => void;
}

export const [getCourseLearningContext, setCourseLearningContext] =
	createContext<CourseLearningContext>();
