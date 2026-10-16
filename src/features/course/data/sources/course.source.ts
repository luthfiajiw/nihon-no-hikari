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
}
