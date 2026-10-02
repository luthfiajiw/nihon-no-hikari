import type { CourseDetailResponse, ListCourseResponse } from '../../domain/entities/course.entity';
import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseSource } from '../sources/course.source';

export class CourseRepositoryImpl implements CourseRepository {
	constructor(private readonly courseSource: CourseSource) {}

	getList(): Promise<ListCourseResponse> {
		return this.courseSource.getList();
	}

	getDetail(id: string): Promise<CourseDetailResponse> {
		return this.courseSource.getDetail(id);
	}
}
