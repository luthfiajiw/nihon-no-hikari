import { requestFetch } from '#request-fetch';
import { AdminSource } from '$features/admin/data/sources/admin.source';
import { AdminRepositoryImpl } from '$features/admin/data/repositories/admin.repository.impl';
import { CheckAdminAccessUseCase } from '$features/admin/domain/usecases/check-admin-access.usecase';
import { GetAdminCatalogUseCase } from '$features/admin/domain/usecases/get-admin-catalog.usecase';
import { GetAdminContentListUseCase } from '$features/admin/domain/usecases/get-admin-content-list.usecase';
import { GetAdminCourseDetailUseCase } from '$features/admin/domain/usecases/get-admin-course-detail.usecase';
import { GetAdminEditorUseCase } from '$features/admin/domain/usecases/get-admin-editor.usecase';
import { ManageAdminContentUseCase } from '$features/admin/domain/usecases/manage-admin-content.usecase';
import { GetAdminUsersUseCase } from '$features/admin/domain/usecases/get-admin-users.usecase';
import { ChangeAdminUserRoleUseCase } from '$features/admin/domain/usecases/change-admin-user-role.usecase';
import { PreviewAdminLessonUseCase } from '$features/admin/domain/usecases/preview-admin-lesson.usecase';

const repository = new AdminRepositoryImpl(new AdminSource(requestFetch));

export const checkAdminAccessUseCase = new CheckAdminAccessUseCase(repository);
export const getAdminCatalogUseCase = new GetAdminCatalogUseCase(repository);
export const getAdminContentListUseCase = new GetAdminContentListUseCase(repository);
export const getAdminCourseDetailUseCase = new GetAdminCourseDetailUseCase(repository);
export const getAdminEditorUseCase = new GetAdminEditorUseCase(repository);
export const manageAdminContentUseCase = new ManageAdminContentUseCase(repository);
export const getAdminUsersUseCase = new GetAdminUsersUseCase(repository);
export const changeAdminUserRoleUseCase = new ChangeAdminUserRoleUseCase(repository);
export const previewAdminLessonUseCase = new PreviewAdminLessonUseCase(repository);
