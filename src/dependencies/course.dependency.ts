import { ReorderCourseAdminContentUseCase } from '$features/course/domain/usecases/course-admin-reorder.usecase';
import { PreviewCourseAdminLessonUseCase } from '$features/course/domain/usecases/course-admin-lesson-preview.usecase';
import { ManageCourseAdminContentUseCase } from '$features/course/domain/usecases/course-admin-content.usecase';
import { GetCourseAdminEditorUseCase } from '$features/course/domain/usecases/course-admin-editor.usecase';
import { GetCourseAdminDetailUseCase } from '$features/course/domain/usecases/course-admin-detail.usecase';
import { GetCourseAdminContentListUseCase } from '$features/course/domain/usecases/course-admin-content-list.usecase';
import { GetCourseAdminCatalogUseCase } from '$features/course/domain/usecases/course-admin-catalog.usecase';
import { requestFetch } from '#request-fetch';
import { CourseRepositoryImpl } from '$features/course/data/repositories/course.repository.impl';
import { CourseSource } from '$features/course/data/sources/course.source';
import { GetListCoursesUseCase } from '$features/course/domain/usecases/get-list-courses.usecase';
import { GetCourseDetailUseCase } from '$features/course/domain/usecases/get-course-detail.usecase';
import { GetCourseModulesUseCase } from '$features/course/domain/usecases/get-course-modules.usecase';
import { GetLessonDetailUseCase } from '$features/course/domain/usecases/get-lesson-detail.usecase';
import { UpdateModuleProgressUseCase } from '$features/course/domain/usecases/update-module-progress.usecase';
import { UpdateLessonProgressUseCase } from '$features/course/domain/usecases/update-lesson-progress.usecase';

const courseSource = new CourseSource(requestFetch);
const courseRepository = new CourseRepositoryImpl(courseSource);

export const getListCoursesUseCase = new GetListCoursesUseCase(courseRepository);
export const getCourseDetailUseCase = new GetCourseDetailUseCase(courseRepository);
export const getCourseModulesUseCase = new GetCourseModulesUseCase(courseRepository);
export const getLessonDetailUseCase = new GetLessonDetailUseCase(courseRepository);
export const updateModuleProgressUseCase = new UpdateModuleProgressUseCase(courseRepository);
export const updateLessonProgressUseCase = new UpdateLessonProgressUseCase(courseRepository);

export const getCourseAdminCatalogUseCase = new GetCourseAdminCatalogUseCase(courseRepository);

export const getCourseAdminContentListUseCase = new GetCourseAdminContentListUseCase(
	courseRepository
);

export const getCourseAdminDetailUseCase = new GetCourseAdminDetailUseCase(courseRepository);

export const getCourseAdminEditorUseCase = new GetCourseAdminEditorUseCase(courseRepository);

export const manageCourseAdminContentUseCase = new ManageCourseAdminContentUseCase(
	courseRepository
);

export const previewCourseAdminLessonUseCase = new PreviewCourseAdminLessonUseCase(
	courseRepository
);

export const reorderCourseAdminContentUseCase = new ReorderCourseAdminContentUseCase(
	courseRepository
);

export const courseAdminCatalogReader = { getCatalog: () => courseRepository.getAdminCatalog() };
