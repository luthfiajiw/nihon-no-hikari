import { requestJson } from '$lib/http/request-json';
import type {
	CourseAdminReorderKind,
	CourseAdminReorderInput,
	CourseAdminCatalog,
	CourseAdminContentKind,
	CourseAdminContentDetail,
	CourseAdminRecord,
	CourseAdminContentRecord,
	CourseAdminMutationResult,
	CourseAdminLessonContent
} from '../../domain/entities/course-admin.entity';
import { courseAdminContentResources } from '../course-admin-endpoints';
type ApiPayload<T> = { data: T; error?: string; message?: string };
import type {
	CourseDetailResponse,
	ListCourseResponse,
	UpdateModuleProgressRequest,
	UpdateModuleProgressResponse
} from '../../domain/entities/course.entity';
import type {
	LessonDetailResponse,
	ListModuleLessonResponse,
	UpdateLessonProgressRequest,
	UpdateLessonProgressResponse
} from '../../domain/entities/lesson.entity';

type ErrorResponse = { error?: string; message?: string };

export class CourseSource {
	constructor(private readonly fetcher: typeof fetch) {}

	async getList(): Promise<ListCourseResponse> {
		const response = await this.fetcher('/api/v1/courses', {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});
		const data = (await response.json().catch(() => ({}))) as ListCourseResponse & ErrorResponse;

		if (!response.ok) {
			throw new Error(data?.error || data?.message || 'Gagal mengambil daftar kursus.');
		}

		return data;
	}

	async getDetail(id: string): Promise<CourseDetailResponse> {
		const response = await this.fetcher(`/api/v1/courses/${encodeURIComponent(id)}`, {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});
		const data = (await response.json().catch(() => ({}))) as CourseDetailResponse & ErrorResponse;

		if (!response.ok) {
			throw new Error(data?.error || data?.message || 'Gagal mengambil detail kursus.');
		}

		return data;
	}

	async getModules(courseId: string): Promise<ListModuleLessonResponse> {
		const response = await this.fetcher(
			`/api/v1/lessons?courseId=${encodeURIComponent(courseId)}`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json'
				}
			}
		);
		const data = (await response.json().catch(() => ({}))) as ListModuleLessonResponse &
			ErrorResponse;

		if (!response.ok) {
			throw new Error(data?.error || data?.message || 'Gagal mengambil modul dan materi kursus.');
		}

		return data;
	}

	async getLesson(lessonId: string): Promise<LessonDetailResponse> {
		const response = await this.fetcher(`/api/v1/lessons/${encodeURIComponent(lessonId)}`, {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});
		const data = (await response.json().catch(() => ({}))) as LessonDetailResponse & ErrorResponse;

		if (!response.ok) {
			throw new Error(data?.error || data?.message || 'Gagal mengambil detail materi.');
		}

		return data;
	}

	async updateModuleProgress(
		courseId: string,
		moduleId: string,
		payload: UpdateModuleProgressRequest
	): Promise<UpdateModuleProgressResponse> {
		const response = await this.fetcher(
			`/api/v1/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/progress`,
			{
				method: 'PUT',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			}
		);
		const data = (await response.json().catch(() => ({}))) as UpdateModuleProgressResponse &
			ErrorResponse;

		if (!response.ok) {
			throw new Error(data?.error || data?.message || 'Gagal memperbarui progres modul.');
		}

		return data;
	}

	async updateLessonProgress(
		lessonId: string,
		payload: UpdateLessonProgressRequest
	): Promise<UpdateLessonProgressResponse> {
		const response = await this.fetcher(
			`/api/v1/lessons/${encodeURIComponent(lessonId)}/progress`,
			{
				method: 'PUT',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			}
		);
		const data = (await response.json().catch(() => ({}))) as UpdateLessonProgressResponse &
			ErrorResponse;

		if (!response.ok) {
			throw new Error(data?.error || data?.message || 'Gagal memperbarui progres materi.');
		}

		return data;
	}
	private adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
		return requestJson<T>(this.fetcher, `/api/v1/admin${path}`, options);
	}

	private contentPath(kind: CourseAdminContentKind, id?: string): string {
		return `/${courseAdminContentResources[kind]}${id ? `/${encodeURIComponent(id)}` : ''}`;
	}

	async reorderAdminContent(
		kind: CourseAdminReorderKind,
		input: CourseAdminReorderInput
	): Promise<void> {
		await this.adminRequest(`${this.contentPath(kind)}/reorder`, {
			method: 'POST',
			body: JSON.stringify(input)
		});
	}

	async getAdminCatalog(courseId?: string): Promise<CourseAdminCatalog> {
		const payload = await this.adminRequest<ApiPayload<CourseAdminCatalog>>(
			`/catalog${courseId ? `?course_id=${encodeURIComponent(courseId)}` : ''}`
		);
		return payload.data;
	}

	async getAdminContentList(kind: CourseAdminContentKind): Promise<CourseAdminRecord[]> {
		return (await this.adminRequest<ApiPayload<CourseAdminRecord[]>>(this.contentPath(kind))).data;
	}

	getAdminContent(kind: CourseAdminContentKind, id: string): Promise<CourseAdminContentDetail> {
		return this.adminRequest(this.contentPath(kind, id));
	}

	async getAdminLevels(): Promise<CourseAdminContentRecord[]> {
		return (await this.adminRequest<ApiPayload<CourseAdminContentRecord[]>>('/levels')).data;
	}

	saveAdminContent(
		kind: CourseAdminContentKind,
		id: string | null,
		payload: CourseAdminContentRecord
	): Promise<CourseAdminMutationResult> {
		return this.adminRequest(this.contentPath(kind, id ?? undefined), {
			method: id ? 'PATCH' : 'POST',
			body: JSON.stringify(payload)
		});
	}

	publishAdminContent(
		kind: CourseAdminContentKind,
		id: string
	): Promise<CourseAdminMutationResult> {
		return this.adminRequest(`${this.contentPath(kind, id)}/publish`, { method: 'POST' });
	}

	async removeAdminContent(kind: CourseAdminContentKind, id: string): Promise<void> {
		await this.adminRequest(this.contentPath(kind, id), { method: 'DELETE' });
	}

	async restoreAdminContent(kind: CourseAdminContentKind, id: string): Promise<void> {
		await this.adminRequest(`${this.contentPath(kind, id)}/restore`, { method: 'POST' });
	}

	async previewAdminLesson(content: CourseAdminLessonContent): Promise<CourseAdminLessonContent> {
		return (
			await this.adminRequest<ApiPayload<CourseAdminLessonContent>>(
				`${this.contentPath('lesson')}/preview`,
				{
					method: 'POST',
					body: JSON.stringify({ content })
				}
			)
		).data;
	}
}
