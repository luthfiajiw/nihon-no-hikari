import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';
import { HttpClient } from '$lib/http-client';
import { getValidAccessToken } from '$lib/server/auth';
import { AdminError } from '$features/admin/domain/entities/admin.entity';
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

// Bind credentials and fetch to this request, so concurrent admins never share auth state.
export function createAdminDependencies(event: RequestEvent) {
	const client = new HttpClient({
		fetch: event.fetch,
		baseUrl: env.API_BASE_URL?.replace(/\/$/, '') ?? ''
	});
	client.onRequest(async (config) => {
		const token = await getValidAccessToken(event);
		if (!token) throw new AdminError(401, 'Silakan masuk kembali.');
		if (!env.API_BASE_URL) throw new AdminError(500, 'API_BASE_URL belum dikonfigurasi.');
		return { ...config, headers: { ...config.headers, Authorization: `Bearer ${token}` } };
	});
	const repository = new AdminRepositoryImpl(new AdminSource(client));
	return {
		checkAdminAccessUseCase: new CheckAdminAccessUseCase(repository),
		getAdminCatalogUseCase: new GetAdminCatalogUseCase(repository),
		getAdminContentListUseCase: new GetAdminContentListUseCase(repository),
		getAdminCourseDetailUseCase: new GetAdminCourseDetailUseCase(repository),
		getAdminEditorUseCase: new GetAdminEditorUseCase(repository),
		manageAdminContentUseCase: new ManageAdminContentUseCase(repository),
		getAdminUsersUseCase: new GetAdminUsersUseCase(repository),
		changeAdminUserRoleUseCase: new ChangeAdminUserRoleUseCase(repository),
		previewAdminLessonUseCase: new PreviewAdminLessonUseCase(repository)
	};
}
