import { createContext } from 'svelte';
import type { Course, Module } from '../../domain/entities/course.entity';

export interface CourseLearningSelection {
	course: Course | null;
	module: Module | null;
}

export interface CourseLearningContext extends Readonly<CourseLearningSelection> {
	select: (course: Course, module: Module) => void;
}

export const [getCourseLearningContext, setCourseLearningContext] =
	createContext<CourseLearningContext>();
