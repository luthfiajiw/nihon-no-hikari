import { CourseRepositoryImpl } from '$features/course/data/repositories/course.repository.impl';
import { CourseSource } from '$features/course/data/sources/course.source';
import { GetListCoursesUseCase } from '$features/course/domain/usecases/get-list-courses.usecase';
import { GetCourseDetailUseCase } from '$features/course/domain/usecases/get-course-detail.usecase';
import { GetCourseModulesUseCase } from '$features/course/domain/usecases/get-course-modules.usecase';
import { GetLessonDetailUseCase } from '$features/course/domain/usecases/get-lesson-detail.usecase';
import { UpdateModuleProgressUseCase } from '$features/course/domain/usecases/update-module-progress.usecase';
import { apiClient } from './api.dependency';

const courseSource = new CourseSource(apiClient);
const courseRepository = new CourseRepositoryImpl(courseSource);

export const getListCoursesUseCase = new GetListCoursesUseCase(courseRepository);
export const getCourseDetailUseCase = new GetCourseDetailUseCase(courseRepository);
export const getCourseModulesUseCase = new GetCourseModulesUseCase(courseRepository);
export const getLessonDetailUseCase = new GetLessonDetailUseCase(courseRepository);
export const updateModuleProgressUseCase = new UpdateModuleProgressUseCase(courseRepository);
