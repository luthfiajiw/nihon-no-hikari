import type {
	CourseDetailResponse,
	ListCourseResponse,
	UpdateModuleProgressRequest,
	UpdateModuleProgressResponse
} from '../../domain/entities/course.entity';
import type {
	LessonDetailResponse,
	ListModuleLessonResponse
} from '../../domain/entities/lesson.entity';
import { HttpClient } from '$lib/http-client';

export class CourseSource {
	constructor(private readonly httpClient: HttpClient) {}

	async getList(): Promise<ListCourseResponse> {
		const response = await this.httpClient.request<ListCourseResponse>('/v1/courses', {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(response.data?.message || 'Gagal mengambil daftar kursus.');
		}

		return response.data;
	}

	async getDetail(id: string): Promise<CourseDetailResponse> {
		const response = await this.httpClient.request<CourseDetailResponse>(
			`/v1/courses/${encodeURIComponent(id)}`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json'
				}
			}
		);

		if (!response.ok) {
			throw new Error(response.data?.message || 'Gagal mengambil detail kursus.');
		}

		return response.data;
	}

	async getModules(courseId: string): Promise<ListModuleLessonResponse> {
		const response = await this.httpClient.request<ListModuleLessonResponse>(
			`/v1/courses/${encodeURIComponent(courseId)}/modules`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json'
				}
			}
		);

		if (!response.ok) {
			throw new Error(response.data?.message || 'Gagal mengambil modul dan materi kursus.');
		}

		return response.data;
	}

	async getLesson(courseId: string, lessonId: string): Promise<LessonDetailResponse> {
		const response = await this.httpClient.request<LessonDetailResponse>(
			`/v1/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json'
				}
			}
		);

		if (!response.ok) {
			throw new Error(response.data?.message || 'Gagal mengambil detail materi.');
		}

		return response.data;
	}

	async updateModuleProgress(
		courseId: string,
		moduleId: string,
		payload: UpdateModuleProgressRequest
	): Promise<UpdateModuleProgressResponse> {
		const response = await this.httpClient.request<UpdateModuleProgressResponse>(
			`/v1/courses/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/progress`,
			{
				method: 'PUT',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			}
		);

		if (!response.ok) {
			throw new Error(response.data?.message || 'Gagal memperbarui progres modul.');
		}

		return response.data;
	}
}
