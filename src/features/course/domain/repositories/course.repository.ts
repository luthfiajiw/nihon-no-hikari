import type { CourseDetailResponse, ListCourseResponse } from '../entities/course.entity';

export interface CourseRepository {
	getList(): Promise<ListCourseResponse>;
	getDetail(id: string): Promise<CourseDetailResponse>;
}
