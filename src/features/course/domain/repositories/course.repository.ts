import type { ListCourseResponse } from '../entities/course.entity';

export interface CourseRepository {
	getList(): Promise<ListCourseResponse>;
}
