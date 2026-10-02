import { CourseRepositoryImpl } from '$features/course/data/repositories/course.repository.impl';
import { CourseSource } from '$features/course/data/sources/course.source';
import { GetListCoursesUseCase } from '$features/course/domain/usecases/get-list-courses.usecase';
import { apiClient } from './api.dependency';

const courseSource = new CourseSource(apiClient);
const courseRepository = new CourseRepositoryImpl(courseSource);

export const getListCoursesUseCase = new GetListCoursesUseCase(courseRepository);
